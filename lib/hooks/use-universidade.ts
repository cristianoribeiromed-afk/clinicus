"use client";

import { useState, useEffect, useCallback } from "react";

export type Universidade = "interamericana" | "cde";

const CHAVE_LOCALSTORAGE = "clinicus_universidade";

/**
 * Mesmo critério do site estático (resumos-clinicus/index.html,
 * função isMateriaCDE): um item pertence à UCP — Ciudad del Este quando
 * "CDE" aparece como palavra isolada no nome da disciplina
 * (ex.: "Fisiología II — CDE"). Não é um campo de banco -- é dado real
 * (o nome já existe), só que decidido por um critério de texto, igual
 * lá. Nenhum item com esse padrão pertence à Universidad Interamericana,
 * e vice-versa.
 */
export function ehDisciplinaCDE(nomeDisciplina: string): boolean {
  return /\bCDE\b/i.test(nomeDisciplina);
}

/**
 * Escolha de universidade do aluno, persistida em localStorage (mesmo
 * padrão do site estático -- pergunta uma vez, lembra depois). Não é uma
 * preferência de conta salva no banco; é só do dispositivo, como lá.
 */
export function useUniversidade() {
  const [universidade, setUniversidadeState] = useState<Universidade | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const salva = localStorage.getItem(CHAVE_LOCALSTORAGE);
      if (salva === "interamericana" || salva === "cde") {
        setUniversidadeState(salva);
      }
    } catch {
      // localStorage indisponível (modo privado, etc.) -- fica sem escolha
      // salva, o aluno escolhe de novo a cada visita. Não quebra a tela.
    }
    setCarregado(true);
  }, []);

  const escolherUniversidade = useCallback((uni: Universidade) => {
    setUniversidadeState(uni);
    try {
      localStorage.setItem(CHAVE_LOCALSTORAGE, uni);
    } catch {
      // idem -- só não persiste entre visitas.
    }
  }, []);

  return { universidade, carregado, escolherUniversidade };
}
