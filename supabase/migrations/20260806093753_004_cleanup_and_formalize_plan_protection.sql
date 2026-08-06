/*
  # Limpa duplicação e formaliza o trigger prevent_plan_self_update

  ## Parte 1 — Remove duplicação criada pela migração 003
  A migração 003 criou um trigger `update_access_sync_updated_at` pra
  manter `updated_at` em dia na tabela `access_sync` — só que, ao
  auditar o banco de produção, descobrimos que já existia um trigger
  fazendo exatamente a mesma coisa, com outro nome:
  `trg_access_sync_atualizado_em`. Agora tinham os dois rodando juntos
  a cada UPDATE — redundante, mas inofensivo (ambos fazem a mesma
  atribuição). Essa migração remove o que a 003 criou, mantendo só o
  original que já estava em produção.

  ## Parte 2 — Formaliza prevent_plan_self_update no controle de versão
  Mesmo problema já visto com `access_sync`: esse trigger + função já
  existem e estão rodando em produção, protegendo a tabela `users`
  contra alteração direta de `plan`/`plan_expires_at` por qualquer
  role que não seja `service_role` — mas nunca foram versionados em
  nenhuma migração do repositório.

  Essa é uma proteção importante (impede um aluno de dar UPDATE na
  própria linha e se auto-conceder um plano pago, mesmo que a política
  de RLS permita ao dono editar sua própria linha para outros campos).
  Reconstruída aqui EXATAMENTE como confirmado via introspecção direta
  do banco (pg_get_functiondef), célula por célula, sem alterar
  nenhuma linha de lógica — só documentando o que já existe.

  ## Como validar depois de aplicar
  SELECT pg_get_functiondef(oid) FROM pg_proc
  WHERE proname = 'prevent_plan_self_update';
  -- deve ser idêntica à versão que já rodava antes dessa migração
*/

-- ============================================================
-- 1) Remove a duplicação criada pela migração 003
-- ============================================================
DROP TRIGGER IF EXISTS update_access_sync_updated_at ON public.access_sync;
-- Mantém trg_access_sync_atualizado_em (o original) intacto — não mexe nele.

-- ============================================================
-- 2) Formaliza prevent_plan_self_update (já existe, só documentando)
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_plan_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- service_role (webhook do Mercado Pago, rota de checkout) sempre pode
  -- Qualquer outra role (authenticated, anon) não pode alterar plan/plan_expires_at
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    IF NEW.plan IS DISTINCT FROM OLD.plan
       OR NEW.plan_expires_at IS DISTINCT FROM OLD.plan_expires_at THEN
      RAISE EXCEPTION 'Alteração de plano não permitida diretamente. O plano só muda através do fluxo de pagamento.'
        USING ERRCODE = '42501'; -- insufficient_privilege
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_prevent_plan_self_update ON public.users;
CREATE TRIGGER trg_prevent_plan_self_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_plan_self_update();

COMMENT ON FUNCTION public.prevent_plan_self_update() IS 'Impede que qualquer role diferente de service_role altere plan ou plan_expires_at diretamente em public.users. Só o webhook do Mercado Pago (que usa a service role key) pode ativar/renovar um plano. Camada extra de defesa além da política de RLS que permite ao dono editar sua própria linha.';
