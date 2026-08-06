"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/auth-store";

export interface DisciplinaComVersoes {
  semestre: string;
  disciplina: string;
  professores: string[];
}

/**
 * Combo Personalizado. Duas responsabilidades:
 * 1. Listar quais disciplinas (semestre+nome) têm mais de 1 professor
 *    disponível -- só essas precisam de uma escolha do aluno.
 * 2. Ler/gravar a escolha de cada aluno (tabela professor_escolhas).
 *
 * A biblioteca (useContentList/useDisciplinasReais) usa a escolha
 * gravada aqui pra filtrar automaticamente qual versão mostrar --
 * o aluno nunca vê "professor" na tela, só o nome limpo da disciplina.
 */
export function useComboPersonalizado() {
  const { user } = useAuthStore();
  const [disciplinasComVersoes, setDisciplinasComVersoes] = useState<
    DisciplinaComVersoes[]
  >([]);
  const [escolhas, setEscolhas] = useState<Record<string, string>>({});
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chave = (semestre: string, disciplina: string) =>
    `${semestre}::${disciplina}`;

  const carregar = useCallback(async () => {
    try {
      setLoading(true);

      const { data: versoesData, error: versoesError } = await supabase
        .from("disciplinas_com_multiplas_versoes")
        .select("semestre, disciplina, professores");
      if (versoesError) throw versoesError;
      setDisciplinasComVersoes((versoesData || []) as DisciplinaComVersoes[]);

      if (user) {
        const { data: escolhasData, error: escolhasError } = await supabase
          .from("professor_escolhas")
          .select("semestre, disciplina, professor")
          .eq("user_id", user.id);
        if (escolhasError) throw escolhasError;

        const mapa: Record<string, string> = {};
        for (const e of (escolhasData || []) as Array<{
          semestre: string;
          disciplina: string;
          professor: string;
        }>) {
          mapa[chave(e.semestre, e.disciplina)] = e.professor;
        }
        setEscolhas(mapa);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar o combo",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const escolherProfessor = useCallback(
    async (semestre: string, disciplina: string, professor: string) => {
      if (!user) throw new Error("Faça login para montar seu combo.");

      const { error: upsertError } = await supabase
        .from("professor_escolhas")
        .upsert(
          { user_id: user.id, semestre, disciplina, professor },
          { onConflict: "user_id,semestre,disciplina" },
        );
      if (upsertError) throw upsertError;

      setEscolhas((prev) => ({
        ...prev,
        [chave(semestre, disciplina)]: professor,
      }));
    },
    [user],
  );

  const professorEscolhido = useCallback(
    (semestre: string, disciplina: string) => escolhas[chave(semestre, disciplina)] ?? null,
    [escolhas],
  );

  /** Disciplinas com múltiplas versões que o aluno AINDA não escolheu. */
  const pendentes = disciplinasComVersoes.filter(
    (d) => !professorEscolhido(d.semestre, d.disciplina),
  );

  return {
    disciplinasComVersoes,
    escolhas,
    pendentes,
    isLoading,
    error,
    escolherProfessor,
    professorEscolhido,
    refetch: carregar,
  };
}
