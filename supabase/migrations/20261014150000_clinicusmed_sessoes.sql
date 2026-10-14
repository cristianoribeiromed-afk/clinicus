-- ClinicusMed — controle de sessão e auditoria (somente ADIÇÕES).
--
-- Política: UMA sessão ativa por conta. Um login novo assume a vaga e a
-- sessão anterior passa a ser recusada pelo porteiro (Cloudflare Worker).
-- Nada aqui altera ou apaga tabelas existentes.

-- 1) Sessões conhecidas de cada aluno
create table if not exists public.cm_sessions (
  session_id     uuid primary key,             -- claim "session_id" do JWT do Supabase Auth
  user_id        uuid not null references auth.users(id) on delete cascade,
  device_label   text,
  user_agent     text,
  created_at     timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  ended_at       timestamptz,
  ended_reason   text                          -- 'substituida' | 'admin' | 'logout'
);
create index if not exists cm_sessions_user_idx on public.cm_sessions(user_id, created_at desc);

-- 2) A sessão que está valendo agora (uma por usuário)
create table if not exists public.cm_active_session (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  session_id  uuid not null,
  claimed_at  timestamptz not null default now()
);

-- 3) Registro de eventos (sem senhas nem tokens)
create table if not exists public.cm_events (
  id          bigint generated always as identity primary key,
  user_id     uuid,
  event       text not null,                   -- login | troca_dispositivo | suspeita | admin_encerrou | logout
  detail      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists cm_events_user_idx on public.cm_events(user_id, created_at desc);

-- Acesso às tabelas só pelas funções abaixo (RLS ligada, sem políticas de cliente)
alter table public.cm_sessions       enable row level security;
alter table public.cm_active_session enable row level security;
alter table public.cm_events         enable row level security;
revoke all on public.cm_sessions, public.cm_active_session, public.cm_events from anon, authenticated;

-- Limite para marcar uso suspeito (trocas de aparelho em 7 dias)
create or replace function public.cm_limite_trocas_semana() returns int
language sql immutable set search_path = '' as $$ select 5 $$;

-- ---------------------------------------------------------------------------
-- cm_claim_session: chamada logo após o login. Torna a sessão atual a única
-- ativa da conta e registra a troca de aparelho, se houver.
-- ---------------------------------------------------------------------------
create or replace function public.cm_claim_session(p_device_label text default null, p_user_agent text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_sid   uuid := nullif(auth.jwt() ->> 'session_id', '')::uuid;
  v_prev  uuid;
  v_trocas int;
begin
  if v_uid is null or v_sid is null then
    raise exception 'nao_autenticado' using errcode = '28000';
  end if;

  select session_id into v_prev from public.cm_active_session where user_id = v_uid;

  insert into public.cm_sessions(session_id, user_id, device_label, user_agent)
  values (v_sid, v_uid, left(p_device_label, 80), left(p_user_agent, 300))
  on conflict (session_id) do update set last_seen_at = now(), ended_at = null, ended_reason = null;

  insert into public.cm_active_session(user_id, session_id, claimed_at)
  values (v_uid, v_sid, now())
  on conflict (user_id) do update set session_id = excluded.session_id, claimed_at = now();

  if v_prev is not null and v_prev <> v_sid then
    update public.cm_sessions set ended_at = now(), ended_reason = 'substituida'
     where session_id = v_prev and ended_at is null;
    insert into public.cm_events(user_id, event, detail)
    values (v_uid, 'troca_dispositivo', jsonb_build_object('anterior', v_prev, 'nova', v_sid, 'aparelho', left(p_device_label, 80)));

    select count(*) into v_trocas from public.cm_events
     where user_id = v_uid and event = 'troca_dispositivo' and created_at > now() - interval '7 days';
    if v_trocas > public.cm_limite_trocas_semana() then
      insert into public.cm_events(user_id, event, detail)
      values (v_uid, 'suspeita', jsonb_build_object('trocas_7d', v_trocas));
    end if;
  elsif v_prev is null or v_prev <> v_sid then
    insert into public.cm_events(user_id, event, detail)
    values (v_uid, 'login', jsonb_build_object('aparelho', left(p_device_label, 80)));
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- cm_gate: o porteiro chama a cada página/PDF protegido.
-- Devolve se a sessão do JWT é a ativa, se o e-mail está confirmado e quais
-- planos ativos o e-mail possui em access_sync (fonte de verdade das compras).
-- ---------------------------------------------------------------------------
create or replace function public.cm_gate()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_sid   uuid := nullif(auth.jwt() ->> 'session_id', '')::uuid;
  v_email text;
  v_conf  boolean;
  v_ativa uuid;
  v_planos text[];
begin
  if v_uid is null then
    return jsonb_build_object('autenticado', false);
  end if;

  select lower(u.email), u.email_confirmed_at is not null
    into v_email, v_conf
    from auth.users u where u.id = v_uid;

  select session_id into v_ativa from public.cm_active_session where user_id = v_uid;

  select coalesce(array_agg(distinct lower(a.plano)), '{}')
    into v_planos
    from public.access_sync a
   where lower(a.email) = v_email and a.ativo;

  return jsonb_build_object(
    'autenticado', true,
    'email_confirmado', coalesce(v_conf, false),
    'sessao_ativa', v_ativa is not null and v_ativa = v_sid,
    'sessao_registrada', v_ativa is not null,
    'planos', to_jsonb(v_planos)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- cm_logout: o próprio aluno encerra a sessão atual.
-- ---------------------------------------------------------------------------
create or replace function public.cm_logout()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_sid uuid := nullif(auth.jwt() ->> 'session_id', '')::uuid;
begin
  if v_uid is null then return; end if;
  delete from public.cm_active_session where user_id = v_uid and session_id = v_sid;
  update public.cm_sessions set ended_at = now(), ended_reason = 'logout' where session_id = v_sid and ended_at is null;
  insert into public.cm_events(user_id, event) values (v_uid, 'logout');
end;
$$;

-- ---------------------------------------------------------------------------
-- cm_admin_encerrar_sessoes: SOMENTE service_role (painel do Supabase / SQL).
-- Derruba a sessão ativa do aluno; ele precisa entrar de novo.
-- ---------------------------------------------------------------------------
create or replace function public.cm_admin_encerrar_sessoes(p_email text)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid;
  v_n int;
begin
  select id into v_uid from auth.users where lower(email) = lower(p_email);
  if v_uid is null then return 0; end if;
  delete from public.cm_active_session where user_id = v_uid;
  update public.cm_sessions set ended_at = now(), ended_reason = 'admin' where user_id = v_uid and ended_at is null;
  get diagnostics v_n = row_count;
  insert into public.cm_events(user_id, event, detail) values (v_uid, 'admin_encerrou', jsonb_build_object('sessoes', v_n));
  return v_n;
end;
$$;

-- Permissões: menor privilégio
revoke all on function public.cm_claim_session(text, text)          from public, anon;
revoke all on function public.cm_gate()                             from public, anon;
revoke all on function public.cm_logout()                           from public, anon;
revoke all on function public.cm_admin_encerrar_sessoes(text)       from public, anon, authenticated;
revoke all on function public.cm_limite_trocas_semana()             from public, anon;
grant execute on function public.cm_claim_session(text, text) to authenticated;
grant execute on function public.cm_gate()                     to authenticated;
grant execute on function public.cm_logout()                   to authenticated;
grant execute on function public.cm_limite_trocas_semana()     to authenticated;
grant execute on function public.cm_admin_encerrar_sessoes(text) to service_role;
