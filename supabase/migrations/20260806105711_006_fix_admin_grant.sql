/*
  # Corrige migração 005 — UPDATE bloqueado pelo próprio trigger que acabamos de criar

  ## O que aconteceu
  A migração 005 criou o trigger trg_prevent_admin_self_elevation e,
  na sequência, tentou marcar ribeiro@unochapeco.edu.br como admin —
  mas essa UPDATE roda através do SQL Editor do Supabase, que se
  conecta como um usuário administrativo direto no Postgres, NÃO como
  a role "service_role" usada pelas chamadas via API/PostgREST. Como
  auth.role() só retorna 'service_role' em chamadas que passam pela
  API, o próprio gatilho de segurança bloqueou a promoção.

  Isso confirma, na prática, que o trigger está funcionando
  exatamente como desenhado — só precisamos de uma forma de rodar
  essa UPDATE específica sem passar pela checagem, já que é uma ação
  administrativa direta no banco (não uma chamada de client).

  ## Solução
  Desabilita o trigger só durante essa UPDATE pontual, e reabilita
  logo em seguida — padrão comum e seguro para esse tipo de migração
  administrativa.
*/

ALTER TABLE public.users DISABLE TRIGGER trg_prevent_admin_self_elevation;

UPDATE public.users
SET is_admin = true
WHERE email = 'ribeiro@unochapeco.edu.br';

ALTER TABLE public.users ENABLE TRIGGER trg_prevent_admin_self_elevation;
