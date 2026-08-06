/*
  # Fase 1 da migração — prepara conteudos pra receber o catálogo do ClinicusMed

  ## Contexto
  Decisão confirmada: ClinicusMed (site estático, 300+ páginas, GitHub
  Pages) e Clinicus SaaS passam a ser o MESMO produto. A estratégia
  escolhida é "Strangler Fig": as páginas HTML continuam existindo
  exatamente como estão (não vamos reescrever 300 páginas em React
  agora) — o Supabase passa a ser a fonte de verdade de autenticação,
  paywall e progresso, e cada linha de `conteudos` aponta pra URL real
  da página já publicada, via o campo `file_url` que já existia.

  ## O que esta migration faz
  1. Adiciona `semestre` e `etapa` em conteudos — a tabela já tinha
     disciplina/tipo/premium, mas não tinha como representar a
     organização por semestre e por etapa (P1/P2/Final) que o
     catalogo.json do ClinicusMed já usa. Sem isso, a importação
     perderia essa estrutura.
  2. Adiciona `slug` — identificador legível (ex:
     "semestre-01-anatomia1-cap01"), útil pra URLs e pra runs de
     importação futuras serem idempotentes (reconhecer "essa linha já
     existe, é update, não insert").
  3. Índices pra busca por semestre/disciplina/etapa (a Jornada/
     dashboard vai filtrar por isso o tempo todo).

  ## O que NÃO está nessa migration (de propósito)
  A importação de fato dos 300+ itens do catalogo.json não é uma
  migration SQL — é um script (fora do supabase/migrations/) que lê o
  catalogo.json do repositório resumos-clinicus e faz upsert em
  conteudos. Migration é pra SCHEMA, não pra carga de dados de
  conteúdo real — misturar os dois deixaria essa migration gigante e
  travaria toda vez que o catálogo mudasse.
*/

ALTER TABLE public.conteudos ADD COLUMN IF NOT EXISTS semestre TEXT;
ALTER TABLE public.conteudos ADD COLUMN IF NOT EXISTS etapa TEXT CHECK (etapa IN ('P1', 'P2', 'Final') OR etapa IS NULL);
ALTER TABLE public.conteudos ADD COLUMN IF NOT EXISTS slug TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'conteudos_slug_key'
  ) THEN
    ALTER TABLE public.conteudos ADD CONSTRAINT conteudos_slug_key UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_conteudos_semestre ON public.conteudos(semestre);
CREATE INDEX IF NOT EXISTS idx_conteudos_disciplina ON public.conteudos(disciplina);
CREATE INDEX IF NOT EXISTS idx_conteudos_etapa ON public.conteudos(etapa);
CREATE INDEX IF NOT EXISTS idx_conteudos_slug ON public.conteudos(slug);

COMMENT ON COLUMN public.conteudos.semestre IS 'Ex: semestre-01, semestre-03. Preenchido na importação do catalogo.json do ClinicusMed.';
COMMENT ON COLUMN public.conteudos.etapa IS 'P1, P2 ou Final -- estrutura de etapas do ClinicusMed.';
COMMENT ON COLUMN public.conteudos.slug IS 'Identificador legível e estável, usado pra upsert idempotente na importação (ex: semestre-01-anatomia1-cap01-generalidades).';
COMMENT ON COLUMN public.conteudos.file_url IS 'URL da página estática já publicada (GitHub Pages) contendo o conteúdo real -- Guia de Estudo, Flashcards, Banco de Questões etc. já funcionando. A Fase 1 da migração NÃO reescreve esse HTML, só passa a controlar acesso a ele pelo Supabase.';
