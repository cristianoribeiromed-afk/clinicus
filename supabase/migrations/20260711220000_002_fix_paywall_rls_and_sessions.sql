/*
  # Fix paywall enforcement + add session control

  ## Contexto
  A política de RLS anterior ("Authenticated users can read conteudos") usava
  `USING (true)`, ou seja, qualquer usuário autenticado — inclusive plano Free —
  conseguia ler o conteúdo COMPLETO de itens premium (conteudo_html, file_url,
  Questões com gabarito) diretamente via Supabase client, ignorando o paywall
  visual da interface.

  ## O que esta migration faz
  1. Remove a política antiga e cria uma nova que só libera linhas `premium = true`
     para usuários com plano pago ativo (monthly/annual, dentro da validade).
  2. Cria duas funções SECURITY DEFINER (`get_conteudos_preview` e
     `get_conteudo_preview_by_id`) que retornam apenas os campos "seguros"
     (título, descrição, tags, premium, etc — nunca conteudo_html/file_url/Questões),
     liberadas para todo mundo. Isso permite listar e mostrar a tela de paywall
     com título/descrição reais mesmo para quem não pagou, sem nunca expor o
     conteúdo protegido.
  3. Cria a tabela `user_sessions`, usada por app/api/auth/session/route.ts para
     bloquear login simultâneo (essa tabela nunca tinha sido criada — por isso
     o bloqueio de sessão não funcionava).
*/

-- ============================================================
-- 1) Corrige a política de leitura de `conteudos`
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can read conteudos" ON public.conteudos;

CREATE POLICY "Authenticated users can read accessible conteudos"
  ON public.conteudos FOR SELECT
  TO authenticated
  USING (
    premium = false
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.plan <> 'free'
        AND (u.plan_expires_at IS NULL OR u.plan_expires_at > now())
    )
  );

-- (a política para `anon` já estava correta — premium = false — mantida como está)

-- ============================================================
-- 2) Funções de preview seguro (nunca retornam campos protegidos)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_conteudos_preview(
  p_tipo text DEFAULT NULL,
  p_disciplina text DEFAULT NULL,
  p_ciclo text DEFAULT NULL,
  p_limit int DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  tipo text,
  titulo text,
  disciplina text,
  ciclo text,
  descricao text,
  premium boolean,
  tags text[],
  created_at timestamptz,
  updated_at timestamptz,
  visualizacoes integer,
  tempo_por_questao integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT c.id, c.tipo, c.titulo, c.disciplina, c.ciclo, c.descricao, c.premium,
         c.tags, c.created_at, c.updated_at, c.visualizacoes, c.tempo_por_questao
  FROM public.conteudos c
  WHERE (p_tipo IS NULL OR c.tipo = p_tipo)
    AND (p_disciplina IS NULL OR c.disciplina = p_disciplina)
    AND (p_ciclo IS NULL OR c.ciclo = p_ciclo)
  ORDER BY c.created_at DESC
  LIMIT COALESCE(p_limit, 1000000);
$$;

CREATE OR REPLACE FUNCTION public.get_conteudo_preview_by_id(p_id uuid)
RETURNS TABLE (
  id uuid,
  tipo text,
  titulo text,
  disciplina text,
  ciclo text,
  descricao text,
  premium boolean,
  tags text[],
  created_at timestamptz,
  updated_at timestamptz,
  visualizacoes integer,
  tempo_por_questao integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT c.id, c.tipo, c.titulo, c.disciplina, c.ciclo, c.descricao, c.premium,
         c.tags, c.created_at, c.updated_at, c.visualizacoes, c.tempo_por_questao
  FROM public.conteudos c
  WHERE c.id = p_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_conteudos_preview TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_conteudo_preview_by_id TO anon, authenticated;

-- ============================================================
-- 3) Tabela de sessões (bloqueio de login simultâneo)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_info TEXT,
  ip_address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Toda a leitura/escrita dessa tabela passa pela service role (via /api/auth/session),
-- então não liberamos acesso direto nem para authenticated nem para anon.
CREATE POLICY "Users can read own sessions"
  ON public.user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active);

COMMENT ON TABLE public.user_sessions IS 'Controle de sessão ativa por usuário — usado para bloquear login simultâneo em múltiplos dispositivos.';
COMMENT ON FUNCTION public.get_conteudos_preview IS 'Retorna metadados seguros de conteudos (sem conteudo_html/file_url/Questões) para listagens e telas de paywall, independente do plano do usuário.';
COMMENT ON FUNCTION public.get_conteudo_preview_by_id IS 'Como get_conteudos_preview, mas para um único item pelo id.';
