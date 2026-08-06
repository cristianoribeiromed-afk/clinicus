"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Busca a estrutura REAL de navegação (Semestre → Matéria) direto da
 * tabela `conteudos` -- ou seja, exatamente o que existe hoje no
 * catálogo do ClinicusMed, importado via scripts/data-import/.
 *
 * Substitui a lista fixa DISCIPLINAS de lib/config.ts, que era um
 * currículo INTEIRO fabricado pelo template (72 matérias até
 * semestre 10, cores e ícones escolhidos sem nenhuma relação com o
 * conteúdo real). Ver IDENTIDADE_CLINICUS.md: a navegação segue a
 * lógica real da Clinicus, não o que o template trouxe pronto.
 */

export interface DisciplinaReal {
  semestre: string;
  disciplina: string;
  totalItens: number;
  etapas: string[];
}

export interface SemestreAgrupado {
  semestre: string;
  numero: number;
  disciplinas: DisciplinaReal[];
}

export function useDisciplinasReais() {
  const [semestres, setSemestres] = useState<SemestreAgrupado[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisciplinas = useCallback(async () => {
    try {
      setLoading(true);

      // get_conteudos_preview é SECURITY DEFINER: mostra a árvore de
      // navegação (título, disciplina, semestre, etapa) pra QUALQUER
      // aluno, pago ou não -- é só o conteúdo em si (file_url,
      // Questões) que fica protegido. Se essa busca usasse uma
      // consulta direta em conteudos, o RLS filtraria por
      // premium=false e a navegação apareceria quase vazia pra quem
      // está no plano Free, o que não é o comportamento certo (todo
      // mundo deve ver a ÁRVORE completa, mesmo sem poder abrir tudo).
      const { data, error: fetchError } = await supabase.rpc(
        "get_conteudos_preview",
      );

      if (fetchError) throw fetchError;

      const rows = (data || []) as Array<{
        semestre: string | null;
        disciplina: string;
        etapa: string | null;
      }>;

      const porSemestre = new Map<string, Map<string, Set<string>>>();

      for (const row of rows) {
        if (!row.semestre) continue; // pula linhas sem semestre (seed antigo etc.)
        if (!porSemestre.has(row.semestre)) {
          porSemestre.set(row.semestre, new Map());
        }
        const porDisciplina = porSemestre.get(row.semestre)!;
        if (!porDisciplina.has(row.disciplina)) {
          porDisciplina.set(row.disciplina, new Set());
        }
        if (row.etapa) porDisciplina.get(row.disciplina)!.add(row.etapa);
      }

      const resultado: SemestreAgrupado[] = Array.from(porSemestre.entries())
        .map(([semestre, disciplinasMap]) => ({
          semestre,
          numero: parseInt(semestre.replace(/\D/g, ""), 10) || 0,
          disciplinas: Array.from(disciplinasMap.entries())
            .map(([disciplina, etapasSet]) => ({
              semestre,
              disciplina,
              totalItens: 0, // preenchido abaixo, se precisar
              etapas: Array.from(etapasSet).sort(),
            }))
            .sort((a, b) => a.disciplina.localeCompare(b.disciplina, "pt-BR")),
        }))
        .sort((a, b) => a.numero - b.numero);

      setSemestres(resultado);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar disciplinas",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisciplinas();
  }, [fetchDisciplinas]);

  return { semestres, isLoading, error, refetch: fetchDisciplinas };
}
