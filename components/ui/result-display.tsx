"use client";

import { motion } from "framer-motion";
import {
  Check,
  X,
  Clock,
  Target,
  TrendingUp,
  RotateCcw,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ResultDisplayProps {
  acertos: number;
  total: number;
  tempoTotal: number;
  Questões: {
    numero: number;
    acertou: boolean;
    respostaUsuario: number;
    respostaCorreta: number;
  }[];
  onRefazer?: () => void;
  onVerGabarito?: () => void;
}

export function ResultDisplay({
  acertos,
  total,
  tempoTotal,
  Questões,
  onRefazer,
  onVerGabarito,
}: ResultDisplayProps) {
  const percentage = Math.round((acertos / total) * 100);
  const tempoMinutos = Math.floor(tempoTotal / 60);
  const tempoSegundos = tempoTotal % 60;

  // Performance level
  const getPerformanceLevel = () => {
    if (percentage >= 90)
      return { label: "Excelente", color: "text-secondary", emoji: "🏆" };
    if (percentage >= 70)
      return { label: "Muito Bom", color: "text-emerald-400", emoji: "🎉" };
    if (percentage >= 50)
      return { label: "Bom", color: "text-blue-400", emoji: "👍" };
    return {
      label: "Continue Estudando",
      color: "text-amber-400",
      emoji: "📚",
    };
  };

  const performance = getPerformanceLevel();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      {/* Main Result Card */}
      <div className="bg-card rounded-2xl border border-border p-8 text-center mb-6">
        {/* Performance Badge */}
        <div className="text-6xl mb-4">{performance.emoji}</div>

        {/* Score */}
        <div className="mb-6">
          <div className="text-5xl font-bold mb-2">
            <span className="text-gradient">{percentage}%</span>
          </div>
          <p className={cn("text-lg font-medium", performance.color)}>
            {performance.label}
          </p>
        </div>

        {/* Progress Circle */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
              fill="none"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 553" }}
              animate={{ strokeDasharray: `${(percentage / 100) * 553} 553` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{acertos}</span>
            <span className="text-muted-foreground">de {total} Questões</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
            <Check className="w-5 h-5 text-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold">{acertos}</div>
            <div className="text-xs text-muted-foreground">Acertos</div>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <X className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{total - acertos}</div>
            <div className="text-xs text-muted-foreground">Erros</div>
          </div>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {tempoMinutos}:{tempoSegundos.toString().padStart(2, "0")}
            </div>
            <div className="text-xs text-muted-foreground">Tempo</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onRefazer && (
            <Button
              onClick={onRefazer}
              variant="outline"
              className="flex-1 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Refazer Simulado
            </Button>
          )}
          {onVerGabarito && (
            <Button
              onClick={onVerGabarito}
              className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            >
              <Eye className="w-4 h-4" />
              Ver Gabarito Completo
            </Button>
          )}
        </div>
      </div>

      {/* Questions Summary */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Resumo por Questao
        </h3>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Questões.map((q) => (
            <div
              key={q.numero}
              className={cn(
                "w-full aspect-square rounded-lg flex items-center justify-center text-sm font-semibold border",
                q.acertou
                  ? "bg-secondary/20 border-secondary/30 text-secondary"
                  : "bg-red-500/20 border-red-500/30 text-red-400",
              )}
            >
              {q.numero}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
