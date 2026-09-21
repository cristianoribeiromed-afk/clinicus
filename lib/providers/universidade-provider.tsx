"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

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

interface UniversidadeContextValue {
  universidade: Universidade | null;
  carregado: boolean;
  escolherUniversidade: (uni: Universidade) => void;
  esquecerUniversidade: () => void;
}

const UniversidadeContext = createContext<UniversidadeContextValue | null>(null);

/**
 * Fica no layout raiz (app/layout.tsx), fora de qualquer página -- é o
 * que garante que a escolha feita numa página (ex.: o link "Trocar
 * universidade" em Disciplinas) é vista imediatamente pelo portão
 * (UniversidadeGate) e por qualquer outra página, sem precisar de reload.
 * Persistida em localStorage (mesmo padrão do site estático: pergunta
 * uma vez, lembra depois -- não é preferência de conta salva no banco).
 */
export function UniversidadeProvider({ children }: { children: ReactNode }) {
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

  const esquecerUniversidade = useCallback(() => {
    setUniversidadeState(null);
    try {
      localStorage.removeItem(CHAVE_LOCALSTORAGE);
    } catch {
      // idem.
    }
  }, []);

  return (
    <UniversidadeContext.Provider
      value={{ universidade, carregado, escolherUniversidade, esquecerUniversidade }}
    >
      {children}
    </UniversidadeContext.Provider>
  );
}

export function useUniversidade(): UniversidadeContextValue {
  const ctx = useContext(UniversidadeContext);
  if (!ctx) {
    throw new Error("useUniversidade precisa estar dentro de <UniversidadeProvider>");
  }
  return ctx;
}
