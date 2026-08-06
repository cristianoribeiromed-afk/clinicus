/*
  # Remove dado de teste/seed da tabela conteudos

  ## Contexto
  Ao importar o catálogo real do ClinicusMed (275 itens, script em
  scripts/data-import/), encontramos 10 linhas pré-existentes em
  conteudos sem nenhuma relação com o catálogo real -- uma delas
  literalmente com titulo = 'Teste'. Todas tinham semestre = NULL
  (todo item importado do ClinicusMed sempre tem semestre preenchido),
  o que confirma que são resíduo de desenvolvimento/seed inicial do
  Clinicus SaaS, não conteúdo de verdade.

  Confirmado antes de apagar: nenhum simulado_results referencia essas
  linhas (SELECT COUNT(*) retornou 0).

  ## O que esta migration faz
  Remove só as linhas com semestre IS NULL -- ou seja, só o que veio
  de antes da importação real. Qualquer conteúdo futuro adicionado
  manualmente pelo painel admin (fora do fluxo de importação do
  catalogo.json) também vai precisar ter semestre preenchido daqui pra
  frente, pra não ser confundido com lixo numa limpeza futura.
*/

DELETE FROM public.conteudos WHERE semestre IS NULL;
