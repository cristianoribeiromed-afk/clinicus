/*
  # Combo Personalizado — professor por disciplina

  ## Modelo escolhido
  `conteudos.disciplina` continua sendo o nome CANÔNICO e limpo que
  aparece na biblioteca (ex: "Anatomía II", "Bioquímica"). Uma nova
  coluna `professor` marca QUAL versão aquele item específico é —
  NULL quando a disciplina só tem 1 versão (a maioria hoje), preenchida
  quando existem múltiplas (ex: "Deborah", "Robert").

  A biblioteca nunca mostra "professor" nem duplica disciplina — ela
  filtra pelo professor que o aluno escolheu (tabela nova
  professor_escolhas) e mostra só isso, com o nome limpo de sempre.

  ## Por que não criar uma disciplina "Bioquímica — Prof. Deborah"
  separada
  Isso quebraria a promessa central do Combo: "a biblioteca deve
  permanecer limpa, mostrando apenas Bioquímica". Se cada professor
  virasse uma disciplina diferente, o aluno veria duas entradas na
  tela em vez de uma.

  ## O que esta migration faz
  1. Adiciona `professor` (nullable) em conteudos.
  2. Cria `professor_escolhas` -- 1 linha por aluno x disciplina x
     semestre, guardando qual professor foi escolhido. RLS: cada
     aluno só lê/escreve a própria escolha.
  3. Cria uma view `disciplinas_com_multiplas_versoes` -- lista, sem
     precisar duplicar lógica no front, quais combinações
     semestre+disciplina realmente têm mais de 1 professor (é só
     nessas que a tela de escolha do combo precisa aparecer; o resto
     é transparente pro aluno).
*/

ALTER TABLE public.conteudos ADD COLUMN IF NOT EXISTS professor TEXT;
CREATE INDEX IF NOT EXISTS idx_conteudos_professor ON public.conteudos(professor);

CREATE TABLE IF NOT EXISTS public.professor_escolhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  semestre TEXT NOT NULL,
  disciplina TEXT NOT NULL,
  professor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'professor_escolhas_unica_por_disciplina'
  ) THEN
    ALTER TABLE public.professor_escolhas
      ADD CONSTRAINT professor_escolhas_unica_por_disciplina
      UNIQUE (user_id, semestre, disciplina);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_professor_escolhas_user ON public.professor_escolhas(user_id);

ALTER TABLE public.professor_escolhas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own professor choices" ON public.professor_escolhas;
CREATE POLICY "Users can read own professor choices"
  ON public.professor_escolhas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own professor choices" ON public.professor_escolhas;
CREATE POLICY "Users can insert own professor choices"
  ON public.professor_escolhas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own professor choices" ON public.professor_escolhas;
CREATE POLICY "Users can update own professor choices"
  ON public.professor_escolhas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_professor_escolhas_updated_at ON public.professor_escolhas;
CREATE TRIGGER update_professor_escolhas_updated_at
  BEFORE UPDATE ON public.professor_escolhas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- View: quais disciplinas realmente precisam de escolha de combo
-- ============================================================
CREATE OR REPLACE VIEW public.disciplinas_com_multiplas_versoes AS
SELECT semestre, disciplina, array_agg(DISTINCT professor ORDER BY professor) AS professores
FROM public.conteudos
WHERE professor IS NOT NULL AND semestre IS NOT NULL
GROUP BY semestre, disciplina
HAVING COUNT(DISTINCT professor) > 1;

COMMENT ON COLUMN public.conteudos.professor IS 'NULL = disciplina com 1 versão só. Preenchido = uma das múltiplas versões da mesma disciplina (Combo Personalizado). O nome que aparece pro aluno é sempre `disciplina`, nunca professor.';
COMMENT ON TABLE public.professor_escolhas IS 'Combo Personalizado: qual professor o aluno escolheu para cada disciplina com múltiplas versões. 1 escolha ativa por aluno x semestre x disciplina.';
COMMENT ON VIEW public.disciplinas_com_multiplas_versoes IS 'Lista as combinações semestre+disciplina que têm mais de 1 professor -- só essas precisam da tela de escolha de combo; o resto é transparente pro aluno.';
