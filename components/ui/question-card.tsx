"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, ChevronRight, Lightbulb } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Questao, Difficulty } from "@/types";

interface QuestionCardProps {
  questao: Questao;
  questaoNumber: number;
  totalQuestões: number;
  onAnswer: (resposta: number) => void;
  showResult?: boolean;
  selectedAnswer?: number;
  isTimed?: boolean;
  timeRemaining?: number;
}

const difficultyColors: Record<Difficulty, string> = {
  facil: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medio: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  dificil: "bg-red-500/20 text-red-400 border-red-500/30",
};

const difficultyLabels: Record<Difficulty, string> = {
  facil: "Facil",
  medio: "Medio",
  dificil: "Dificil",
};

const alternativaLabels = ["A", "B", "C", "D", "E"];

export function QuestionCard({
  questao,
  questaoNumber,
  totalQuestões,
  onAnswer,
  showResult = false,
  selectedAnswer,
  isTimed = false,
  timeRemaining,
}: QuestionCardProps) {
  const [showExplicacao, setShowExplicacao] = useState(false);
  const isCorrect = selectedAnswer === questao.gabarito;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-sm font-medium">
            Questao {questaoNumber}/{totalQuestões}
          </span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs border",
              difficultyColors[questao.dificuldade],
            )}
          >
            {difficultyLabels[questao.dificuldade]}
          </span>
        </div>
        {isTimed && timeRemaining !== undefined && (
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-lg",
              timeRemaining < 30
                ? "bg-red-500/20 text-red-400"
                : "bg-card text-muted-foreground",
            )}
          >
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm">
              {Math.floor(timeRemaining / 60)}:
              {(timeRemaining % 60).toString().padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-card rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(questaoNumber / totalQuestões) * 100}%` }}
        />
      </div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card rounded-2xl border border-border p-6 mb-6"
      >
        <p className="text-lg leading-relaxed whitespace-pre-wrap">
          {questao.enunciado}
        </p>
      </motion.div>

      {/* Alternatives */}
      <div className="space-y-3">
        {questao.alternativas.map((alternativa, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectChoice = index === questao.gabarito;
          const showFeedback = showResult;

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => !showFeedback && onAnswer(index)}
              disabled={showFeedback}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-all duration-300",
                !showFeedback && "hover:border-primary/50 hover:bg-primary/5",
                !showFeedback && isSelected && "border-primary bg-primary/10",
                showFeedback &&
                  isCorrectChoice &&
                  "border-secondary bg-secondary/10",
                showFeedback &&
                  isSelected &&
                  !isCorrectChoice &&
                  "border-red-500 bg-red-500/10",
                showFeedback &&
                  !isSelected &&
                  !isCorrectChoice &&
                  "border-border opacity-50",
                "disabled:cursor-default",
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0",
                    !showFeedback && isSelected && "bg-primary text-white",
                    !showFeedback &&
                      !isSelected &&
                      "bg-card border border-border",
                    showFeedback &&
                      isCorrectChoice &&
                      "bg-secondary text-white",
                    showFeedback &&
                      isSelected &&
                      !isCorrectChoice &&
                      "bg-red-500 text-white",
                  )}
                >
                  {showFeedback && isCorrectChoice ? (
                    <Check className="w-5 h-5" />
                  ) : showFeedback && isSelected && !isCorrectChoice ? (
                    <X className="w-5 h-5" />
                  ) : (
                    alternativaLabels[index]
                  )}
                </div>
                <span className="text-sm leading-relaxed pt-1">
                  {alternativa}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Result & Explanation */}
      <AnimatePresence>
        {showResult && selectedAnswer !== undefined && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <div
              className={cn(
                "rounded-xl p-4 mb-4 border",
                isCorrect
                  ? "bg-secondary/10 border-secondary/30"
                  : "bg-red-500/10 border-red-500/30",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <>
                    <Check className="w-5 h-5 text-secondary" />
                    <span className="font-semibold text-secondary">
                      Correto!
                    </span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-red-400" />
                    <span className="font-semibold text-red-400">
                      Incorreto
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                A resposta correta e a alternativa{" "}
                <strong>{alternativaLabels[questao.gabarito]}</strong>.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowExplicacao(!showExplicacao)}
              className="w-full gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              {showExplicacao ? "Ocultar Explicacao" : "Ver Explicacao"}
              <ChevronRight
                className={cn(
                  "w-4 h-4 transition-transform",
                  showExplicacao && "rotate-90",
                )}
              />
            </Button>

            {showExplicacao && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-4 bg-card rounded-xl border border-border"
              >
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Gabarito Comentado
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {questao.explicacao}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
