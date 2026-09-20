"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ContentType } from "@/types";

/**
 * Agrega, por disciplina, a contagem real de cada tipo de conteúdo
 * (resumo/simulado/caso_clinico). Usa o mesmo RPC `get_conteudos_preview`
 * que `useDisciplinasReais` já usa (SECURITY DEFINER, nunca expõe
 * conteudo_html/file_url/Questões, mostra a árvore pra todo mundo,
 * pago ou não) -- só que aqui a contagem por tipo é calculada de
 * verdade, em vez do `totalItens: 0` que ficou pendente em
 * use-disciplinas.ts.
 *
 * Nenhum número aqui é inventado: cada contagem vem de linhas reais
 * retornadas pelo banco. Se uma disciplina não tem nenhum caso clínico
 * cadastrado, `totalCasos` é 0 de verdade, não um placeholder.
 */

export interface DisciplinaVitrine {
  disciplina: string;
  semestre: string;
  numeroSemestre: number;
  totalResumos: number;
  totalCasos: number;
  totalSimulados: number;
  totalGeral: number;
}

export function useDisciplinasVitrine() {
  const [disciplinas, setDisciplinas] = useState<DisciplinaVitrine[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisciplinas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.rpc(
        "get_conteudos_preview",
      );
      if (fetchError) throw fetchError;

      const rows = (data || []) as Array<{
        tipo: ContentType;
        disciplina: string;
        semestre: string | null;
      }>;

      const porDisciplina = new Map<
        string,
        { semestre: string; resumo: number; simulado: number; caso_clinico: number }
      >();

      for (const row of rows) {
        if (!row.semestre || !row.disciplina) continue;
        if (!porDisciplina.has(row.disciplina)) {
          porDisciplina.set(row.disciplina, {
            semestre: row.semestre,
            resumo: 0,
            simulado: 0,
            caso_clinico: 0,
          });
        }
        const contagem = porDisciplina.get(row.disciplina)!;
        if (row.tipo === "resumo") contagem.resumo += 1;
        else if (row.tipo === "simulado") contagem.simulado += 1;
        else if (row.tipo === "caso_clinico") contagem.caso_clinico += 1;
      }

      const resultado: DisciplinaVitrine[] = Array.from(porDisciplina.entries())
        .map(([disciplina, c]) => ({
          disciplina,
          semestre: c.semestre,
          numeroSemestre: parseInt(c.semestre.replace(/\D/g, ""), 10) || 0,
          totalResumos: c.resumo,
          totalCasos: c.caso_clinico,
          totalSimulados: c.simulado,
          totalGeral: c.resumo + c.simulado + c.caso_clinico,
        }))
        .sort((a, b) => {
          if (a.numeroSemestre !== b.numeroSemestre) {
            return a.numeroSemestre - b.numeroSemestre;
          }
          return a.disciplina.localeCompare(b.disciplina, "pt-BR");
        });

      setDisciplinas(resultado);
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

  return { disciplinas, isLoading, error, refetch: fetchDisciplinas };
}
