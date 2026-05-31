"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Content, Questao } from "@/types";

interface UseContentListOptions {
  tipo?: "resumo" | "simulado" | "caso_clínico";
  disciplina?: string;
  ciclo?: "básico" | "clínico";
  premium?: boolean;
  limit?: number;
}

export function useContentList(options: UseContentListOptions = {}) {
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from("conteúdos").select("*");

      if (options.tipo) {
        query = query.eq("tipo", options.tipo);
      }
      if (options.disciplina) {
        query = query.eq("disciplina", options.disciplina);
      }
      if (options.ciclo) {
        query = query.eq("ciclo", options.ciclo);
      }
      if (options.premium !== undefined) {
        query = query.eq("premium", options.premium);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setContents(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar conteúdos",
      );
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  return { contents, isLoading, error, refetch: fetchContents };
}

export function useContent(id: string) {
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("conteúdos")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setContent(data);

        // Increment view count
        if (data) {
          await supabase
            .from("conteúdos")
            .update({ visualizacoes: data.visualizacoes + 1 })
            .eq("id", id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar conteúdo",
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
    if (content?.Questões) {
      setQuestões(content.Questões as Questao[]);
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
