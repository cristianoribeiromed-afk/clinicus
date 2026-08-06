/*
  # Estende get_conteudos_preview e get_conteudo_preview_by_id com semestre/etapa

  ## Contexto
  As funções SECURITY DEFINER de preview (migração 002) foram criadas
  ANTES de semestre/etapa/slug existirem em conteudos (migração 007,
  bem depois). Por isso elas não retornam esses campos -- o que
  impede montar a árvore de navegação real (Semestre → Matéria) sem
  fazer uma consulta direta na tabela, que o RLS filtraria por
  premium (mostrando a árvore de navegação quase vazia pra quem
  não pagou -- e a árvore de navegação, diferente do conteúdo em si,
  deveria ser visível pra todo mundo, pago ou não).

  ## O que esta migration faz
  Recria as duas funções (CREATE OR REPLACE, mesmo comportamento de
  segurança de antes -- nunca retorna conteudo_html/file_url/Questões)
  incluindo semestre, etapa e slug no retorno.
*/

DROP FUNCTION IF EXISTS public.get_conteudos_preview(text, text, text, integer);

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
  tempo_por_questao integer,
  semestre text,
  etapa text,
  slug text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT c.id, c.tipo, c.titulo, c.disciplina, c.ciclo, c.descricao, c.premium,
         c.tags, c.created_at, c.updated_at, c.visualizacoes, c.tempo_por_questao,
         c.semestre, c.etapa, c.slug
  FROM public.conteudos c
  WHERE (p_tipo IS NULL OR c.tipo = p_tipo)
    AND (p_disciplina IS NULL OR c.disciplina = p_disciplina)
    AND (p_ciclo IS NULL OR c.ciclo = p_ciclo)
  ORDER BY c.created_at DESC
  LIMIT COALESCE(p_limit, 1000000);
$$;

DROP FUNCTION IF EXISTS public.get_conteudo_preview_by_id(uuid);

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
  tempo_por_questao integer,
  semestre text,
  etapa text,
  slug text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT c.id, c.tipo, c.titulo, c.disciplina, c.ciclo, c.descricao, c.premium,
         c.tags, c.created_at, c.updated_at, c.visualizacoes, c.tempo_por_questao,
         c.semestre, c.etapa, c.slug
  FROM public.conteudos c
  WHERE c.id = p_id;
$$;
