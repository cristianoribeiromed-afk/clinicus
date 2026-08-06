# Importação do catálogo ClinicusMed pra tabela `conteudos`

Gerado em 2026-08-06, a partir do `catalogo.json` real do repositório
`resumos-clinicus` (275 itens disponíveis no momento da geração —
etapas escondidas/indisponíveis foram puladas de propósito).

## Como reproduzir (quando o catálogo mudar)
1. `gerar_import.py` — lê o catalogo.json e monta `conteudos_import.json`
   (lista intermediária, fácil de auditar antes de virar SQL)
2. `gerar_sql.py` — transforma isso em `import_conteudos.sql`
   (INSERT ... ON CONFLICT (slug) DO UPDATE — seguro rodar de novo,
   atualiza em vez de duplicar)

## Decisão que precisa de confirmação humana
`ciclo` (básico/clínico) foi inferido como semestre 1-5 = básico,
6-10 = clínico — ASSUNÇÃO, não veio do catalogo.json (que não tem
esse conceito). Se a divisão real da faculdade for diferente, roda
um UPDATE depois de importar, não precisa gerar tudo de novo.
