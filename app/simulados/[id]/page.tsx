"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/app-layout";
import { QuestionCard } from "@/components/ui/question-card";
import { ResultDisplay } from "@/components/ui/result-display";
import { Paywall } from "@/components/ui/paywall";
import { useAuth } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/lib/auth-store";
import { ContentSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Brain, Lock } from "lucide-react";
import Link from "next/link";
import type { Content, Questao } from "@/types";

function SimuladoContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const simuladoId = params.id as string;

  const { profile, isLoading: authLoading } = useAuth(true);
  const { isPremium } = useAuthStore();

  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const Questões: Questao[] = content?.Questões
    ? (content.Questões as Questao[])
    : [];

  // Fetch simulado
  useEffect(() => {
    const fetchSimulado = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("conteudos")
          .select("*")
          .eq("id", simuladoId)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Simulado nao encontrado");

        const contentData = data as Content;
        setContent(contentData);

        // Set timer
        if (contentData.tempo_por_questao && contentData.Questões) {
          setTempoRestante(
            contentData.tempo_por_questao *
              (contentData.Questões as Questao[]).length,
          );
        }
      } catch (error) {
        console.error("Error fetching simulado:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (simuladoId) fetchSimulado();
  }, [simuladoId]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && tempoRestante > 0) {
      interval = setInterval(() => {
        setTempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, tempoRestante]);

  const handleStart = () => {
    setStartTime(Date.now());
    setIsRunning(true);
  };

  const handleAnswer = (resposta: number) => {
    const newRespostas = [...respostas, resposta];
    setRespostas(newRespostas);

    if (questaoAtual < Questões.length - 1) {
      setQuestaoAtual(questaoAtual + 1);
    } else {
      handleFinish(newRespostas);
    }
  };

  const handleFinish = useCallback(
    async (finalRespostas?: number[]) => {
      const resp = finalRespostas || respostas;
      setIsRunning(false);

      if (content && profile) {
        // Calculate results
        const acertos = resp.reduce((acc, resp, idx) => {
          return acc + (resp === Questões[idx].gabarito ? 1 : 0);
        }, 0);

        // Save result to database
        (async () => {
          try {
            await supabase.from("simulado_results").insert({
              user_id: profile.id,
              simulado_id: content.id,
              respostas: resp,
              acertos,
              total: Questões.length,
              tempo_total: Math.floor((Date.now() - startTime) / 1000),
            } as any);
          } catch (e) {
            console.error("Error saving result:", e);
          }
        })();

        // Update streak
        (async () => {
          try {
            await supabase
              .from("users" as any)
              .update({ last_study_date: new Date().toISOString() } as any)
              .eq("id", profile.id);
          } catch (e) {
            console.error("Error updating streak:", e);
          }
        })();
      }

      setShowResult(true);
    },
    [content, profile, respostas, Questões, startTime],
  );

  const calcularAcertos = () => {
    return respostas.reduce(
      (acc, resp, idx) => acc + (resp === Questões[idx]?.gabarito ? 1 : 0),
      0,
    );
  };

  const handleRefazer = () => {
    setQuestaoAtual(0);
    setRespostas([]);
    setShowResult(false);
    setStartTime(Date.now());
    if (content?.tempo_por_questao && content?.Questões) {
      setTempoRestante(
        content.tempo_por_questao * (content.Questões as Questao[]).length,
      );
    }
    setIsRunning(true);
  };

  // Check premium access
  const hasAccess = !content?.premium || isPremium;

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-8">
          <ContentSkeleton />
        </div>
      </AppLayout>
    );
  }

  if (!content) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">
            Simulado nao encontrado
          </h2>
          <Link href="/simulados">
            <Button variant="outline">Voltar para Simulados</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/simulados"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Simulados
          </Link>
        </motion.div>

        {/* Simulado Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm text-primary font-medium">
                  Simulado
                </span>
                <span className="text-sm text-muted-foreground">
                  {content.disciplina}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold">
                {content.titulo}
              </h1>
              <p className="text-muted-foreground mt-1">{content.descricao}</p>
            </div>
            {isRunning && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border border-border">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-mono text-lg">
                  {Math.floor(tempoRestante / 60)}:
                  {(tempoRestante % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!hasAccess ? (
            <motion.div
              key="paywall"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[400px]"
            >
              <Paywall
                title="Simulado Premium"
                description="Este simulado exclusivo possui Questões selecionadas e gabarito comentado detalhado."
                ctaText="Assinar para Acessar"
              />
            </motion.div>
          ) : !isRunning && !showResult ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto space-y-6">
                <div className="p-4 rounded-xl bg-card border border-border inline-block">
                  <Brain className="w-16 h-16 text-primary mx-auto" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">Pronto para comecar?</h2>
                  <p className="text-muted-foreground">
                    {Questões.length} Questões | Tempo:{" "}
                    {Math.round(
                      (Questões.length * (content.tempo_por_questao || 90)) /
                        60,
                    )}{" "}
                    minutos
                  </p>
                </div>
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  Iniciar Simulado
                </Button>
              </div>
            </motion.div>
          ) : showResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <ResultDisplay
                acertos={calcularAcertos()}
                total={Questões.length}
                tempoTotal={Math.floor((Date.now() - startTime) / 1000)}
                Questões={Questões.map((q, idx) => ({
                  numero: idx + 1,
                  acertou: respostas[idx] === q.gabarito,
                  respostaUsuario: respostas[idx],
                  respostaCorreta: q.gabarito,
                }))}
                onRefazer={handleRefazer}
              />
            </motion.div>
          ) : (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex justify-center"
            >
              <QuestionCard
                questao={Questões[questaoAtual]}
                questaoNumber={questaoAtual + 1}
                totalQuestões={Questões.length}
                onAnswer={handleAnswer}
                isTimed={!!content.tempo_por_questao}
                timeRemaining={tempoRestante}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

export default function SimuladoPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="p-8">Carregando...</div>
        </AppLayout>
      }
    >
      <SimuladoContent />
    </Suspense>
  );
}
