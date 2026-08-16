"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/auth-store";
import { loggedQuery, logLoadingFim } from "@/lib/supabase-debug";
import type { Content, Questao } from "@/types";

interface UseContentListOptions {
  tipo?: "resumo" | "simulado" | "caso_clinico";
  disciplina?: string;
  ciclo?: "basico" | "clinico";
  premium?: boolean;
  limit?: number;
}

export function useContentList(options: UseContentListOptions = {}) {
  const { user } = useAuthStore();
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = useCallback(async () => {
    // Rede de segurança: se a query travar sem nunca resolver nem rejeitar
    // (rede lenta, RPC presa, env var errada na Vercel), força o loading a
    // terminar em 10s com um erro visível -- em vez de deixar a tela presa
    // num esqueleto de carregamento pra sempre (mesmo padrão já usado no
    // useAuth pra evitar a "tela em branco").
    let finished = false;
    const timeoutId = setTimeout(() => {
      if (!finished) {
        console.error(
          "Timeout: useContentList não respondeu em 10s. Verifique a RPC get_conteudos_preview / conexão com Supabase.",
        );
        setError(
          "Não foi possível carregar o conteúdo. Verifique sua conexão e tente novamente.",
        );
        setLoading(false);
      }
    }, 10000);

    try {
      setLoading(true);
      setError(null);
      // Usa a função RPC de preview (nunca traz conteudo_html/file_url/Questões),
      // por isso funciona igual pra usuário free e pago — o paywall é decidido
      // na tela a partir do campo `premium`, sem nunca baixar o conteúdo protegido.
      const { data, error: fetchError } = await loggedQuery(
        `useContentList: listar conteúdos (tipo=${options.tipo ?? "todos"})`,
        supabase.rpc("get_conteudos_preview", {
          p_tipo: options.tipo ?? null,
          p_disciplina: options.disciplina ?? null,
          p_ciclo: options.ciclo ?? null,
          p_limit: options.limit ?? null,
        }),
        {
          rpc: "get_conteudos_preview",
          filtros: {
            tipo: options.tipo,
            disciplina: options.disciplina,
            ciclo: options.ciclo,
          },
        },
      );

      if (fetchError) throw fetchError;

      let result = (data || []) as Array<Content & { professor?: string | null; semestre?: string | null }>;
      if (options.premium !== undefined) {
        result = result.filter((c) => c.premium === options.premium);
      }

      // Combo Personalizado: itens sem `professor` aparecem sempre (disciplina
      // com 1 versão só). Itens COM `professor` só aparecem se baterem com a
      // escolha do aluno pra essa disciplina+semestre -- assim a biblioteca
      // nunca mostra duas versões duplicadas da mesma matéria.
      const temItemComProfessor = result.some((c) => c.professor);
      if (temItemComProfessor) {
        const escolhasMap: Record<string, string> = {};
        if (user) {
          const { data: escolhasData } = await supabase
            .from("professor_escolhas")
            .select("semestre, disciplina, professor")
            .eq("user_id", user.id);
          for (const e of (escolhasData || []) as Array<{
            semestre: string;
            disciplina: string;
            professor: string;
          }>) {
            escolhasMap[`${e.semestre}::${e.disciplina}`] = e.professor;
          }
        }
        result = result.filter((c) => {
          if (!c.professor) return true;
          const escolhido = escolhasMap[`${c.semestre}::${c.disciplina}`];
          return escolhido === c.professor;
        });
      }

      setContents(result as Content[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar conteudos",
      );
    } finally {
      finished = true;
      clearTimeout(timeoutId);
      logLoadingFim("useContentList");
      setLoading(false);
    }
  }, [
    options.tipo,
    options.disciplina,
    options.ciclo,
    options.premium,
    options.limit,
    user,
  ]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  return { contents, isLoading, error, refetch: fetchContents };
}

// Busca um conteudo com acesso seguro:
// 1) Sempre busca o preview (metadados) via RPC — funciona pra qualquer usuário.
// 2) Só tenta buscar o conteudo completo se o item não for premium OU se o RLS
//    liberar (usuário com plano pago ativo). Se o RLS bloquear, `full` volta
//    null e a tela mostra o Paywall usando os metadados do preview — nunca
//    chega a existir no navegador o conteudo protegido de quem não pagou.
export function useContentAccess(id: string) {
  const [preview, setPreview] = useState<Content | null>(null);
  const [full, setFull] = useState<Content | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        setLoading(true);

        const { data: previewData, error: previewError } = await supabase
          .rpc("get_conteudo_preview_by_id", { p_id: id })
          .maybeSingle();

        if (previewError) throw previewError;
        setPreview((previewData as Content) ?? null);

        if (previewData) {
          const { data: fullData } = await supabase
            .from("conteudos")
            .select("*")
            .eq("id", id)
            .maybeSingle();

          setFull(fullData as Content | null);

          if (fullData) {
            await supabase
              .from("conteudos")
              .update({ visualizacoes: (fullData.visualizacoes ?? 0) + 1 })
              .eq("id", id);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar conteudo",
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const hasAccess = !!full;
  const content = full ?? preview;

  return { content, preview, hasAccess, isLoading, error };
}

/** @deprecated use `useContentAccess` — este hook ainda faz select("*") direto
 * e não deve ser usado para conteúdo premium. Mantido só por compatibilidade. */
export function useContent(id: string) {
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("conteudos")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setContent(data);

        // Increment view count
        if (data) {
          await supabase
            .from("conteudos")
            .update({ visualizacoes: data.visualizacoes + 1 })
            .eq("id", id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar conteudo",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchContent();
  }, [id]);

  return { content, isLoading, error };
}

export function useQuestões(content: Content | null) {
  const [Questões, setQuestões] = useState<Questao[]>([]);

  useEffect(() => {
    if (content?.questoes) {
      setQuestões(content.questoes as Questao[]);
    }
  }, [content]);

  return Questões;
}

// Hook for favorites
export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data } = await supabase
        .from("users")
        .select("favorites")
        .eq("id", userId)
        .maybeSingle();
      setFavorites(data?.favorites || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const toggleFavorite = useCallback(
    async (contentId: string) => {
      if (!userId) return;

      const newFavorites = favorites.includes(contentId)
        ? favorites.filter((id) => id !== contentId)
        : [...favorites, contentId];

      try {
        await supabase
          .from("users")
          .update({ favorites: newFavorites })
          .eq("id", userId);
        setFavorites(newFavorites);
      } catch (error) {
        console.error("Error updating favorites:", error);
      }
    },
    [userId, favorites],
  );

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite: (id: string) => favorites.includes(id),
  };
}
