-- ClinicusMed — administração de acessos (somente ADIÇÕES).
-- Permite ao administrador liberar/desativar acessos e encerrar sessões
-- por uma página do site, em vez de editar a planilha.

create table if not exists public.cm_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  criado_em  timestamptz not null default now()
);
alter table public.cm_admins enable row level security;
revoke all on public.cm_admins from anon, authenticated;

-- Quem chamou é administrador?
create or replace function public.cm_admin_eh()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.cm_admins where user_id = auth.uid());
$$;

create or replace function public.cm_admin_exigir()
returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.cm_admins where user_id = auth.uid()) then
    raise exception 'acesso_negado' using errcode = '42501';
  end if;
end;
$$;

-- Liberar (ou reativar) um plano para um e-mail
create or replace function public.cm_admin_liberar(p_email text, p_plano text, p_nome text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_email text := lower(trim(p_email)); v_plano text := lower(trim(p_plano));
begin
  perform public.cm_admin_exigir();
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'email_invalido'; end if;
  if v_plano = '' then raise exception 'plano_invalido'; end if;
  insert into public.access_sync (email, nome, plano, ativo, origem, data_liberacao)
  values (v_email, nullif(trim(p_nome), ''), v_plano, true, 'manual', current_date)
  on conflict (email, plano) do update set ativo = true, nome = coalesce(excluded.nome, public.access_sync.nome);
  insert into public.cm_events(user_id, event, detail)
  values (auth.uid(), 'admin_liberou', jsonb_build_object('email', v_email, 'plano', v_plano));
  return jsonb_build_object('ok', true);
end;
$$;

-- Desativar um plano de um e-mail (não apaga: fica no histórico)
create or replace function public.cm_admin_desativar(p_email text, p_plano text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_n int;
begin
  perform public.cm_admin_exigir();
  update public.access_sync set ativo = false
   where lower(email) = lower(trim(p_email)) and lower(plano) = lower(trim(p_plano));
  get diagnostics v_n = row_count;
  insert into public.cm_events(user_id, event, detail)
  values (auth.uid(), 'admin_desativou', jsonb_build_object('email', lower(trim(p_email)), 'plano', p_plano));
  return jsonb_build_object('ok', v_n > 0);
end;
$$;

-- Consultar um aluno: acessos, sessões recentes e eventos
create or replace function public.cm_admin_consultar(p_email text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_email text := lower(trim(p_email)); v_uid uuid;
begin
  perform public.cm_admin_exigir();
  select id into v_uid from auth.users where lower(email) = v_email;
  return jsonb_build_object(
    'email', v_email,
    'tem_conta', v_uid is not null,
    'email_confirmado', (select email_confirmed_at is not null from auth.users where id = v_uid),
    'acessos', coalesce((select jsonb_agg(jsonb_build_object('plano', plano, 'ativo', ativo, 'origem', origem, 'data', data_liberacao) order by ativo desc, data_liberacao desc nulls last)
                          from public.access_sync where lower(email) = v_email), '[]'::jsonb),
    'sessoes', coalesce((select jsonb_agg(jsonb_build_object('aparelho', device_label, 'inicio', created_at, 'fim', ended_at, 'motivo', ended_reason) order by created_at desc)
                          from (select * from public.cm_sessions where user_id = v_uid order by created_at desc limit 10) s), '[]'::jsonb),
    'eventos', coalesce((select jsonb_agg(jsonb_build_object('evento', event, 'quando', created_at, 'detalhe', detail) order by created_at desc)
                          from (select * from public.cm_events where user_id = v_uid order by id desc limit 20) e), '[]'::jsonb)
  );
end;
$$;

-- Contas com uso suspeito (muitas trocas de aparelho) nos últimos 30 dias
create or replace function public.cm_admin_suspeitos()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.cm_admin_exigir();
  return coalesce((
    select jsonb_agg(jsonb_build_object('email', u.email, 'trocas', t.n, 'ultima', t.ultima) order by t.n desc)
    from (select user_id, count(*) n, max(created_at) ultima from public.cm_events
           where event = 'troca_dispositivo' and created_at > now() - interval '30 days'
           group by user_id having count(*) >= 3) t
    join auth.users u on u.id = t.user_id), '[]'::jsonb);
end;
$$;

-- Encerrar sessões de um aluno (versão para o administrador logado)
create or replace function public.cm_admin_encerrar(p_email text)
returns int language plpgsql security definer set search_path = '' as $$
begin
  perform public.cm_admin_exigir();
  return public.cm_admin_encerrar_sessoes(p_email);
end;
$$;

revoke all on function public.cm_admin_eh()                          from public, anon;
revoke all on function public.cm_admin_exigir()                      from public, anon, authenticated;
revoke all on function public.cm_admin_liberar(text, text, text)     from public, anon;
revoke all on function public.cm_admin_desativar(text, text)         from public, anon;
revoke all on function public.cm_admin_consultar(text)               from public, anon;
revoke all on function public.cm_admin_suspeitos()                   from public, anon;
revoke all on function public.cm_admin_encerrar(text)                from public, anon;
grant execute on function public.cm_admin_eh()                      to authenticated;
grant execute on function public.cm_admin_liberar(text, text, text) to authenticated;
grant execute on function public.cm_admin_desativar(text, text)     to authenticated;
grant execute on function public.cm_admin_consultar(text)           to authenticated;
grant execute on function public.cm_admin_suspeitos()               to authenticated;
grant execute on function public.cm_admin_encerrar(text)            to authenticated;

-- Primeiro administrador: o dono da plataforma
insert into public.cm_admins(user_id)
select id from auth.users where lower(email) = 'cristianoribeiromed@gmail.com'
on conflict do nothing;
