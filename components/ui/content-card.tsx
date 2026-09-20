"use client";

import Link from "next/link";
import { Clock, Star, Lock, Eye, FileText, Brain, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Content, ContentType } from "@/types";

interface ContentCardProps {
  content: Content;
  isFavorite?: boolean;
  onFavorite?: () => void;
  showDescription?: boolean;
  /** Esconde "Resumo · Disciplina" — usar quando a lista já está agrupada
   * por disciplina (ex.: página de Resumos), pra não repetir a mesma
   * informação em cada card. */
  showTypeLabel?: boolean;
}

const typeIcons: Record<ContentType, typeof Brain> = {
  resumo: FileText,
  simulado: Brain,
  caso_clinico: Heart,
};

const typeLabels: Record<ContentType, string> = {
  resumo: "Resumo",
  simulado: "Simulado",
  caso_clinico: "Caso clínico",
};

// Paleta restrita, reaproveitando os tons que o design system já usa em
// gráficos (tailwind.config.ts, chart-1 a chart-5) mais dois tons próximos
// -- nenhuma cor nova foi inventada só para isto.
const ACCENT_PALETTE = [
  "#3B82F6", // chart-1 (azul)
  "#10B981", // chart-2 (esmeralda)
  "#F59E0B", // chart-3 (âmbar)
  "#EF4444", // chart-4 (vermelho)
  "#8B5CF6", // chart-5 (violeta)
  "#06B6D4", // ciano
  "#EC4899", // rosa
];

// Cor de acento por disciplina, derivada do próprio nome (hash simples) --
// não da lista `DISCIPLINAS` de lib/config.ts, que é um currículo fabricado
// pelo template e não corresponde de forma confiável ao texto real salvo em
// `conteudos.disciplina` (ver LEGACY-AUDIT.md). Isso garante que toda
// disciplina tem uma cor estável e consistente sem depender dessa lista.
function accentForDisciplina(nome: string): string {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = (hash << 5) - hash + nome.charCodeAt(i);
    hash |= 0;
  }
  return ACCENT_PALETTE[Math.abs(hash) % ACCENT_PALETTE.length];
}

// Extrai "01", "02"... de títulos como "Capítulo 1 — Generalidades" -- é uma
// sequência real (ver frontend-design/SKILL.md), por isso vira um número
// grande e discreto no lugar do ícone genérico. Títulos que não seguem esse
// padrão ("Master Osteo...", "Raio-X da Disciplina") caem no ícone do tipo.
function extrairNumeroCapitulo(titulo: string): string | null {
  const match = titulo.match(/cap[íi]tulo\s+(\d+)/i);
  return match ? match[1].padStart(2, "0") : null;
}

export function ContentCard({
  content,
  isFavorite = false,
  onFavorite,
  showDescription = false,
  showTypeLabel = true,
}: ContentCardProps) {
  const TypeIcon = typeIcons[content.tipo];
  const accent = accentForDisciplina(content.disciplina || content.tipo);
  const numeroCapitulo = extrairNumeroCapitulo(content.titulo);

  const totalQuestoes = Array.isArray(content.questoes)
    ? content.questoes.length
    : 0;
  // Tempo e contagem de questões só fazem sentido pra Simulado/Caso
  // clínico -- um Resumo não tem "questões" nem cronômetro. Mostrar "0 min"
  // num Resumo (o que a versão anterior fazia, herdado de um campo que a
  // importação do conteúdo legado preencheu por padrão) parecia um dado
  // quebrado, não uma informação real.
  const mostraMetaDePratica =
    content.tipo !== "resumo" && (totalQuestoes > 0 || !!content.tempo_por_questao);
  const minutosEstimados =
    content.tempo_por_questao && totalQuestoes > 0
      ? Math.round((content.tempo_por_questao * totalQuestoes) / 60)
      : null;

  const getHref = () => {
    switch (content.tipo) {
      case "resumo":
        return `/resumos/${content.id}`;
      case "simulado":
        return `/simulados/${content.id}`;
      case "caso_clinico":
        return `/casos/${content.id}`;
      default:
        return "#";
    }
  };

  return (
    <Link
      href={getHref()}
      className="group relative flex flex-col rounded-lg bg-card border border-border hover:border-white/20 hover:bg-white/[0.02] transition-colors overflow-hidden"
    >
      {/* Aresta de acento -- identidade da disciplina, sem caixa de ícone */}
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: accent }}
        aria-hidden
      />

      <div className="pl-4 pr-3 py-3 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {numeroCapitulo ? (
              <span
                className="text-base font-semibold tabular-nums flex-shrink-0"
                style={{ color: accent }}
              >
                {numeroCapitulo}
              </span>
            ) : (
              <TypeIcon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: accent }}
              />
            )}
            {showTypeLabel && (
              <span className="text-xs text-muted-foreground truncate">
                {typeLabels[content.tipo]} · {content.disciplina}
              </span>
            )}
            {content.etapa && (
              <span className="text-xs text-muted-foreground/70 flex-shrink-0">
                {content.etapa}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
            {onFavorite && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onFavorite();
                }}
                aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                className="text-muted-foreground hover:text-yellow-400 transition-colors"
              >
                <Star
                  className={cn(
                    "w-3.5 h-3.5 transition-colors",
                    isFavorite && "fill-yellow-400 text-yellow-400",
                  )}
                />
              </button>
            )}
            {content.premium && (
              <Lock
                className="w-3.5 h-3.5 text-muted-foreground"
                aria-label="Conteúdo Premium"
              >
                <title>Conteúdo Premium</title>
              </Lock>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {content.titulo}
        </h3>

        {showDescription && content.descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {content.descricao}
          </p>
        )}

        {mostraMetaDePratica && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            {totalQuestoes > 0 && (
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                {totalQuestoes} Questões
              </span>
            )}
            {minutosEstimados !== null && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {minutosEstimados} min
              </span>
            )}
            {content.visualizacoes > 0 && (
              <span className="flex items-center gap-1 ml-auto">
                <Eye className="w-3 h-3" />
                {content.visualizacoes}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// Skeleton version for loading states
export function ContentCardSkeleton() {
  return (
    <div className="relative rounded-lg overflow-hidden bg-card border border-border animate-pulse">
      <span className="absolute inset-y-0 left-0 w-[3px] bg-muted" aria-hidden />
      <div className="pl-4 pr-3 py-3 space-y-2.5">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-2/3 bg-muted rounded" />
      </div>
    </div>
  );
}
