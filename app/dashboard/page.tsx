"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  FileText,
  Heart,
  Clock,
  TrendingUp,
  Calendar,
  Flame,
  BookOpen,
  ArrowRight,
  Crown,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { ContentCard, ContentCardSkeleton } from "@/components/ui/content-card";
import { ProgressBar, StreakIndicator } from "@/components/ui/stats-card";
import { useAuth } from "@/lib/hooks/use-auth";
import { useContentList } from "@/lib/hooks/use-content";
import { useAuthStore } from "@/lib/auth-store";
import { useDisciplinasReais } from "@/lib/hooks/use-disciplinas";
import { Button } from "@/components/ui/button";
import type { Content } from "@/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function DashboardPage() {
  const { user, profile, isLoading: authLoading } = useAuth(true);
  const { isPremium } = useAuthStore();
  const { contents: recentContent, isLoading: contentLoading } = useContentList(
    { limit: 4 },
  );
  const { semestres: semestresReais } = useDisciplinasReais();
  const disciplinasReais = semestresReais.flatMap((s) => s.disciplinas);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (authLoading) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-8 space-y-6">
          <div className="h-24 bg-card rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">
                {getGreeting()}, {profile?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Aluno"}!
              </h1>
              <p className="text-muted-foreground">
                {isPremium
                  ? "Acesso completo a todos os conteúdos"
                  : "Continue sua jornada de estudos"}
              </p>
            </div>
            {profile && <StreakIndicator days={profile.streak_days || 0} />}
          </div>

          {/* Upgrade Banner for Free Users */}
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      Desbloqueie todo o conteudo
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Acesso a todos os resumos, simulados e casos clínicos
                    </p>
                  </div>
                </div>
                <Link href="/planos">
                  <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                    Ver Planos
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              icon: Brain,
              label: "Simulados Feitos",
              value: profile?.simulados_completed?.length || 0,
              color: "text-primary",
            },
            {
              icon: FileText,
              label: "Resumos Lidos",
              value: 0,
              color: "text-secondary",
            },
            {
              icon: Heart,
              label: "Casos Estudados",
              value: 0,
              color: "text-rose-400",
            },
            {
              icon: Clock,
              label: "Horas de Estudo",
              value: 0,
              color: "text-amber-400",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-card ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress by Discipline */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Progresso por Disciplina
            </h2>
            <Link
              href="/resumos"
              className="text-sm text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disciplinasReais.length > 0 ? (
              disciplinasReais.slice(0, 6).map((disc) => (
                <Link
                  key={`${disc.semestre}-${disc.disciplina}`}
                  href={`/resumos?disciplina=${encodeURIComponent(disc.disciplina)}`}
                  className="group block"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-card rounded-xl border border-border p-4 transition-all hover:border-primary/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {disc.disciplina}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {disc.semestre.replace("semestre-", "")}º semestre
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="col-span-full p-8 text-center rounded-xl bg-card border border-border">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma disciplina disponível ainda.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              conteúdos Recentes
            </h2>
            <Link
              href="/resumos"
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contentLoading ? (
              [...Array(4)].map((_, i) => <ContentCardSkeleton key={i} />)
            ) : recentContent && recentContent.length > 0 ? (
              recentContent.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))
            ) : (
              <div className="col-span-full p-8 text-center rounded-xl bg-card border border-border">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Nenhum conteudo ainda</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore nossos resumos, simulados e casos clínicos
                </p>
                <Link href="/resumos">
                  <Button>Explorar conteúdos</Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recommended Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            Recomendados para você
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/simulados"
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              <Brain className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                Simulados Interativos
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Teste seus conhecimentos com Questões comentadas
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                Iniciar <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
            <Link
              href="/casos"
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              <Heart className="w-8 h-8 text-rose-400 mb-4" />
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                Casos clínicos
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Aprimore seu raciocinio clínico
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                Explorar <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
            <Link
              href="/resumos"
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              <FileText className="w-8 h-8 text-secondary mb-4" />
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                Biblioteca de Resumos
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                conteúdos organizados por disciplina
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                Ler <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
