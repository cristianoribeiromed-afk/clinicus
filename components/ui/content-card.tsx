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
   * informação em cada linha. */
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
export function accentForDisciplina(nome: string): string {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = (hash << 5) - hash + nome.charCodeAt(i);
    hash |= 0;
  }
  return ACCENT_PALETTE[Math.abs(hash) % ACCENT_PALETTE.length];
}

// Extrai "01", "02"... de títulos como "Capítulo 1 — Generalidades" -- é uma
// sequência real (ver frontend-design/SKILL.md), por isso vira o número
// mostrado no lugar do ícone genérico. Títulos que não seguem esse padrão
// ("Master Osteo...", "Raio-X da Disciplina") caem no ícone do tipo.
function extrairNumeroCapitulo(titulo: string): string | null {
  const match = titulo.match(/cap[íi]tulo\s+(\d+)/i);
  return match ? match[1].padStart(2, "0") : null;
}

/**
 * Uma linha de currículo, não um card de vitrine -- é assim que Coursera,
 * Khan Academy e afins mostram capítulos/aulas de uma disciplina: lista
 * densa e escaneável, não uma grade de cartões repetidos. O container
 * (grid → lista) muda em cada página que usa isto; ver resumos/casos/
 * simulados, que agora envolvem estas linhas num único bloco com
 * divisores, em vez de um card isolado por item.
 */
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
      className="group flex items-center gap-3.5 px-4 py-3 hover:bg-white/[0.035] transition-colors"
    >
      {/* Selo: número do capítulo (sequência real) ou ícone do tipo,
          sobre um fundo suave na cor da disciplina -- não uma caixa cheia
          gritante. */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-semibold tabular-nums"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        {numeroCapitulo ?? <TypeIcon className="w-4 h-4" />}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-[0.9rem] leading-snug line-clamp-2 text-foreground/95 group-hover:text-primary transition-colors">
          {content.titulo}
        </h3>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
          {showTypeLabel && (
            <span className="truncate">
              {typeLabels[content.tipo]} · {content.disciplina}
            </span>
          )}
          {content.etapa && <span className="text-muted-foreground/70">{content.etapa}</span>}
          {mostraMetaDePratica && totalQuestoes > 0 && (
            <span className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              {totalQuestoes} questões
            </span>
          )}
          {mostraMetaDePratica && minutosEstimados !== null && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {minutosEstimados} min
            </span>
          )}
        </div>

        {showDescription && content.descricao && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {content.descricao}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 pl-2">
        {content.visualizacoes > 0 && (
          <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="w-3.5 h-3.5" />
            {content.visualizacoes}
          </span>
        )}
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
                "w-4 h-4 transition-colors",
                isFavorite && "fill-yellow-400 text-yellow-400",
              )}
            />
          </button>
        )}
        {content.premium && (
          <Lock className="w-4 h-4 text-muted-foreground/70">
            <title>Conteúdo Premium</title>
          </Lock>
        )}
      </div>
    </Link>
  );
}

// Skeleton version for loading states -- uma linha, no mesmo formato da
// lista real (sem borda/fundo próprios; quem envolve é o container da
// página, com divide-y).
export function ContentCardSkeleton() {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 bg-muted rounded" />
        <div className="h-3 w-1/3 bg-muted rounded" />
      </div>
    </div>
  );
}
