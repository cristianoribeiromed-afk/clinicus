/*
  # Formaliza a tabela access_sync no controle de versão

  ## Contexto
  A tabela `access_sync` já existe e está em uso em produção — ela é
  escrita pelo webhook do Mercado Pago (app/api/webhook/mercadopago/route.ts)
  toda vez que um pagamento do ClinicusMed é aprovado, e serve como fonte
  de verdade da liberação de acesso (a planilha do Google Sheets é só um
  espelho automático dela, sincronizado via Apps Script).

  O problema: essa tabela foi criada direto no painel do Supabase, nunca
  passou por uma migração — ou seja, o schema real de produção não estava
  documentado em lugar nenhum do repositório. Isso é dívida técnica
  perigosa: ninguém consegue recriar o ambiente do zero, e qualquer
  alteração futura corre o risco de divergir do que já existe.

  ## O que esta migration faz
  1. Cria a tabela SE ela não existir (do zero, em outro ambiente/projeto).
  2. Adiciona cada coluna individualmente com IF NOT EXISTS — se a tabela
     JÁ existir em produção com uma parte dessas colunas, a migração só
     completa o que falta, sem duplicar nem apagar dado nenhum.
  3. Cria o índice único (email, plano) usado pelo `onConflict` do upsert
     no webhook — SE ele ainda não existir.
  4. Habilita RLS. Hoje, NENHUM client (anon ou authenticated) tem
     política de leitura/escrita nessa tabela — só a service role
     (usada pelo webhook) tem acesso, porque service role ignora RLS.
     Isso é proposital: a tabela ainda não é consumida por nenhuma tela
     autenticada. Quando essa necessidade existir de verdade (ex: aluno
     conferir seu próprio histórico de liberações), a política certa
     entra numa migração própria, revisada com esse caso de uso real em
     mente — não antes, por hipótese.

  ## Como validar depois de aplicar
  Rodar no SQL Editor do Supabase:
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'access_sync'
    ORDER BY ordinal_position;
  E comparar com os campos que o webhook grava (email, nome, plano,
  ativo, data_liberacao, origem, id_transacao) — se bater, o schema
  real de produção agora está 100% refletido aqui no repositório.
*/

-- ============================================================
-- 1) Cria a tabela se não existir (ambiente novo, do zero)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.access_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

-- ============================================================
-- 2) Garante cada coluna, mesmo se a tabela já existia parcialmente
-- ============================================================
ALTER TABLE public.access_sync ADD COLUMN IF NOT EXISTS email TEXT NOT NULL;
ALTER TABLE public.access_sync ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.access_sync ADD COLUMN IF NOT EXISTS plano TEXT NOT NULL;
ALTER TABLE public.access_sync ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.access_sync ADD COLUMN IF NOT EXISTS data_liberacao DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.access_sync ADD COLUMN IF NOT EXISTS origem TEXT NOT NULL DEFAULT 'mercadopago';
ALTER TABLE public.access_sync ADD COLUMN IF NOT EXISTS id_transacao TEXT;
ALTER TABLE public.access_sync ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.access_sync ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Normaliza o e-mail sempre em minúsculas (o webhook já grava assim,
-- mas isso protege contra qualquer outra origem de escrita futura).
-- Em bloco DO pra ser seguro rodar essa migração mais de uma vez —
-- ADD CONSTRAINT sozinho não tem IF NOT EXISTS no Postgres.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'access_sync_email_lowercase'
  ) THEN
    ALTER TABLE public.access_sync ADD CONSTRAINT access_sync_email_lowercase
      CHECK (email = lower(email)) NOT VALID;
  END IF;
END $$;

-- ============================================================
-- 3) Índice único (email, plano) — usado pelo onConflict do upsert
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS access_sync_email_plano_key
  ON public.access_sync (email, plano);

CREATE INDEX IF NOT EXISTS idx_access_sync_email ON public.access_sync(email);
CREATE INDEX IF NOT EXISTS idx_access_sync_ativo ON public.access_sync(ativo);
CREATE INDEX IF NOT EXISTS idx_access_sync_id_transacao ON public.access_sync(id_transacao);

-- ============================================================
-- 4) Trigger de updated_at
-- ============================================================
-- A função abaixo é a MESMA que a migração 001 já define — mas como
-- descobrimos (rodando essa migração) que a 001 nunca foi aplicada
-- nesse projeto Supabase (erro: function update_updated_at_column()
-- does not exist), essa migração 003 não pode mais assumir que ela já
-- existe. CREATE OR REPLACE é seguro de rodar mesmo se a função já
-- existir de outra origem — não quebra nada, só garante.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_access_sync_updated_at ON public.access_sync;
CREATE TRIGGER update_access_sync_updated_at
  BEFORE UPDATE ON public.access_sync
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5) RLS — habilitada, sem políticas de client (só service role)
-- ============================================================
ALTER TABLE public.access_sync ENABLE ROW LEVEL SECURITY;

-- Nenhuma política criada de propósito: enquanto só o webhook (service
-- role) usa essa tabela, deixar sem política pra anon/authenticated é
-- mais seguro do que criar uma política "provisória" que ninguém revisa
-- depois. Service role sempre ignora RLS, então o webhook continua
-- funcionando normalmente.

COMMENT ON TABLE public.access_sync IS 'Fonte de verdade da liberação de acesso do ClinicusMed (produto separado do Clinicus SaaS). Escrita pelo webhook do Mercado Pago quando um pagamento é aprovado; espelhada automaticamente na planilha do Google Sheets via Apps Script. RLS habilitada sem políticas de client — acesso só via service role.';
COMMENT ON COLUMN public.access_sync.plano IS 'Código do produto/combo comprado (ex: semestre-03-bioquimica-combo) — não é o mesmo conceito do campo "plano" da tabela public.users (monthly/annual), são produtos diferentes (ClinicusMed vs Clinicus SaaS).';
COMMENT ON COLUMN public.access_sync.id_transacao IS 'ID do pagamento no Mercado Pago — usado para checar se essa liberação específica já foi processada antes (evita reenviar e-mail de confirmação duplicado em retries de webhook).';
