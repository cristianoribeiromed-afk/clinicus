/*
  # Item 4 da auditoria — admin baseado em tabela, não em lista fixa no código

  ## Problema
  lib/admin-auth.ts tinha uma constante ADMIN_EMAILS = ["ribeiro@..."]
  hardcoded no código. Pra dar acesso a uma segunda pessoa, era preciso
  editar código e fazer deploy. Pior: essa checagem só existe na camada
  de aplicação — se alguma rota nova esquecer de chamar verifyAdmin(),
  não tem nenhuma proteção de banco por trás.

  ## O que esta migration faz
  1. Adiciona is_admin (boolean, default false) em public.users.
  2. Cria um trigger que impede QUALQUER alteração de is_admin que não
     venha da service role — mesmo padrão já usado e testado em
     produção pra proteger plan/plan_expires_at (prevent_plan_self_update).
     Isso significa: mesmo que uma política de RLS futura permita ao
     usuário editar seu próprio perfil, ninguém consegue se autopromover
     a admin só de client — só via service role (painel/script server-side).
  3. Marca ribeiro@unochapeco.edu.br como admin (migra o acesso que já
     existia na lista fixa, sem ninguém perder acesso na troca).
  4. Política de RLS: qualquer usuário autenticado pode ler SEU PRÓPRIO
     is_admin (necessário pro front-end decidir se mostra o link do
     painel admin) — mas ninguém consegue ler o is_admin de outra
     pessoa via client. Isso evita expor "quem é admin" pra qualquer
     usuário logado que resolva inspecionar as respostas da API.

  ## Depois de aplicar essa migration
  lib/admin-auth.ts precisa parar de checar a lista ADMIN_EMAILS e
  passar a consultar public.users.is_admin — isso é feito num commit
  separado no código da aplicação (não faz sentido misturar troca de
  schema com troca de lógica de aplicação no mesmo passo).

  ## Como validar depois de aplicar
  SELECT email, is_admin FROM public.users WHERE is_admin = true;
  -- deve mostrar exatamente ribeiro@unochapeco.edu.br
*/

-- ============================================================
-- 1) Coluna is_admin
-- ============================================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- 2) Trigger de proteção — mesmo padrão do prevent_plan_self_update
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_admin_self_elevation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- service_role (scripts server-side, painel admin via API própria) sempre pode
  -- Qualquer outra role (authenticated, anon) não pode alterar is_admin
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
      RAISE EXCEPTION 'Alteração de permissão de administrador não permitida diretamente.'
        USING ERRCODE = '42501'; -- insufficient_privilege
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_prevent_admin_self_elevation ON public.users;
CREATE TRIGGER trg_prevent_admin_self_elevation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_self_elevation();

-- ============================================================
-- 3) Migra o admin que já existia na lista fixa do código
-- ============================================================
-- Desabilita o trigger só durante essa UPDATE pontual: mesmo rodando
-- essa migração via SQL Editor (conexão direta no Postgres, não
-- 'service_role'), o gatilho criado no passo 2 bloquearia essa
-- própria UPDATE -- confirmado na prática ao aplicar essa migração
-- em produção (ver migração 006, que corrigiu isso depois).
ALTER TABLE public.users DISABLE TRIGGER trg_prevent_admin_self_elevation;

UPDATE public.users
SET is_admin = true
WHERE email = 'ribeiro@unochapeco.edu.br';

ALTER TABLE public.users ENABLE TRIGGER trg_prevent_admin_self_elevation;

-- ============================================================
-- 4) RLS — NÃO precisa de política nova
-- ============================================================
-- A política "Users can read own data" (migração 001) já cobre isso:
-- RLS no Postgres é por LINHA, não por coluna -- se o usuário já pode
-- ler sua própria linha em public.users, ele já vê is_admin junto,
-- sem precisar de uma política adicional. Criar uma nova aqui só
-- geraria duplicação confusa (2 políticas de SELECT fazendo a mesma
-- checagem auth.uid() = id).

COMMENT ON COLUMN public.users.is_admin IS 'Controla acesso ao painel administrativo. Só pode ser alterada via service role (trigger trg_prevent_admin_self_elevation bloqueia qualquer tentativa de auto-promoção via client). Leitura já coberta pela política "Users can read own data" da migração 001.';
