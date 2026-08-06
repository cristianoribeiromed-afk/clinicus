"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Star, Lock, Eye, FileText, Brain, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Content, ContentType } from "@/types";

interface ContentCardProps {
  content: Content;
  isFavorite?: boolean;
  onFavorite?: () => void;
  showDescription?: boolean;
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

const typeColors: Record<ContentType, string> = {
  resumo: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  simulado: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  caso_clinico: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export function ContentCard({
  content,
  isFavorite = false,
  onFavorite,
  showDescription = false,
}: ContentCardProps) {
  const TypeIcon = typeIcons[content.tipo];

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={getHref()}
        className="block group relative rounded-xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300"
      >
        {/* Premium Badge */}
        {content.premium && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/80 backdrop-blur-sm border border-primary/50">
              <Lock className="w-3 h-3 text-white" />
              <span className="text-xs text-white font-medium">Premium</span>
            </div>
          </div>
        )}

        {/* Favorite Button */}
        {onFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavorite();
            }}
            className="absolute top-3 left-3 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:border-primary/50 transition-all"
          >
            <Star
              className={cn(
                "w-4 h-4 transition-colors",
                isFavorite
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground",
              )}
            />
          </button>
        )}

        {/* Thumbnail Area */}
        <div className="relative h-32 bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
          <div className={cn("p-4 rounded-2xl", typeColors[content.tipo])}>
            <TypeIcon className="w-8 h-8" />
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Content Info */}
        <div className="p-4">
          {/* Type Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full border",
                typeColors[content.tipo],
              )}
            >
              {typeLabels[content.tipo]}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {content.disciplina.replace("-", " ")}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {content.titulo}
          </h3>

          {/* Description */}
          {showDescription && content.descricao && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {content.descricao}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {content.questoes && content.questoes.length > 0 && (
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  {Array.isArray(content.questoes)
                    ? content.questoes.length
                    : 0}{" "}
                  Questões
                </span>
              )}
              {content.tempo_por_questao && content.tempo_por_questao > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.round(
                    (content.tempo_por_questao *
                      (Array.isArray(content.questoes)
                        ? content.questoes.length
                        : 0)) /
                      60,
                  )}{" "}
                  min
                </span>
              )}
            </div>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {content.visualizacoes}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Skeleton version for loading states
export function ContentCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border animate-pulse">
      <div className="h-32 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-20 bg-muted rounded" />
        <div className="h-5 w-3/4 bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted rounded" />
      </div>
    </div>
  );
}
