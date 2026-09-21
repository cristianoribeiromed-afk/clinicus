"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Heart, Brain, GraduationCap } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { ContentCard, ContentCardSkeleton, accentForDisciplina } from "@/components/ui/content-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { useContentList } from "@/lib/hooks/use-content";
import { useDisciplinasVitrine } from "@/lib/hooks/use-disciplinas-vitrine";
import type { ContentType } from "@/types";

// Lista de uma aba (Conteúdos / Casos Clínicos / Simulados) -- só busca
// dado quando a aba está de fato ativa (ver comentário mais abaixo sobre
// por que isso importa aqui).
function ListaDeAba({
  disciplina,
  tipo,
  vazio,
}: {
  disciplina: string;
  tipo: ContentType;
  vazio: string;
}) {
  const { contents, isLoading, error, refetch } = useContentList({ disciplina, tipo });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border overflow-hidden divide-y divide-border bg-card">
        {[...Array(4)].map((_, i) => (
          <ContentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center rounded-xl bg-card border border-border">
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button size="sm" onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  if (contents.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-card border border-border">
        <p className="text-sm text-muted-foreground">{vazio}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden divide-y divide-border bg-card">
      {contents.map((content) => (
        <ContentCard key={content.id} content={content} showTypeLabel={false} />
      ))}
    </div>
  );
}

export default function DisciplinaPage() {
  const params = useParams();
  const disciplina = decodeURIComponent(params.disciplina as string);
  useAuth(true);

  const [aba, setAba] = useState<"visao-geral" | "conteudos" | "casos" | "simulados">(
    "visao-geral",
  );

  // Reaproveita o mesmo hook da vitrine e filtra pela disciplina atual --
  // são as mesmas contagens reais mostradas em /disciplinas, sem outra
  // consulta. "Visão geral" mostra só isso: números que já existem de
  // verdade. Nada de progresso, "concluído" ou streak aqui -- esses dados
  // não existem ainda (ver LEGACY-AUDIT.md e o plano do clinicus-saas).
  const { disciplinas, isLoading: carregandoResumo } = useDisciplinasVitrine();
  const resumoDisciplina = disciplinas.find((d) => d.disciplina === disciplina);
  const accent = accentForDisciplina(disciplina);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-4">
        <Link
          href="/disciplinas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Disciplinas
        </Link>

        <div className="flex items-center gap-3">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
          <div>
            <h1 className="text-xl lg:text-2xl font-bold leading-tight">{disciplina}</h1>
            {!carregandoResumo && resumoDisciplina && (
              <p className="text-sm text-muted-foreground capitalize">
                {resumoDisciplina.ciclo ? `Ciclo ${resumoDisciplina.ciclo}` : "Ciclo não classificado"} ·{" "}
                {resumoDisciplina.numeroSemestre}º semestre ·{" "}
                {resumoDisciplina.totalResumos} resumos ·{" "}
                {resumoDisciplina.totalCasos} casos clínicos ·{" "}
                {resumoDisciplina.totalSimulados} simulados
              </p>
            )}
          </div>
        </div>

        <Tabs value={aba} onValueChange={(v) => setAba(v as typeof aba)}>
          <TabsList>
            <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
            <TabsTrigger value="conteudos">Conteúdos</TabsTrigger>
            <TabsTrigger value="casos">Casos clínicos</TabsTrigger>
            <TabsTrigger value="simulados">Simulados</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="pt-4">
            {!resumoDisciplina || resumoDisciplina.totalGeral === 0 ? (
              <div className="p-8 text-center rounded-xl bg-card border border-border">
                <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Ainda não há conteúdo cadastrado para {disciplina}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setAba("conteudos")}
                  className="text-left rounded-xl border border-border bg-card hover:border-white/20 transition-colors p-4 flex items-center gap-3"
                >
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-lg font-semibold leading-none">
                      {resumoDisciplina.totalResumos}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Resumos</p>
                  </div>
                </button>
                <button
                  onClick={() => setAba("casos")}
                  className="text-left rounded-xl border border-border bg-card hover:border-white/20 transition-colors p-4 flex items-center gap-3"
                >
                  <Heart className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <div>
                    <p className="text-lg font-semibold leading-none">
                      {resumoDisciplina.totalCasos}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Casos clínicos</p>
                  </div>
                </button>
                <button
                  onClick={() => setAba("simulados")}
                  className="text-left rounded-xl border border-border bg-card hover:border-white/20 transition-colors p-4 flex items-center gap-3"
                >
                  <Brain className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-lg font-semibold leading-none">
                      {resumoDisciplina.totalSimulados}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Simulados</p>
                  </div>
                </button>
              </div>
            )}
          </TabsContent>

          {/* Cada aba só busca o próprio conteúdo quando fica ativa --
              evita disparar as três consultas (resumo/caso/simulado) de
              uma vez só toda vez que a página abre. */}
          <TabsContent value="conteudos" className="pt-4">
            {aba === "conteudos" && (
              <ListaDeAba
                disciplina={disciplina}
                tipo="resumo"
                vazio="Ainda não há resumos cadastrados nesta disciplina."
              />
            )}
          </TabsContent>
          <TabsContent value="casos" className="pt-4">
            {aba === "casos" && (
              <ListaDeAba
                disciplina={disciplina}
                tipo="caso_clinico"
                vazio="Ainda não há casos clínicos cadastrados nesta disciplina."
              />
            )}
          </TabsContent>
          <TabsContent value="simulados" className="pt-4">
            {aba === "simulados" && (
              <ListaDeAba
                disciplina={disciplina}
                tipo="simulado"
                vazio="Ainda não há simulados cadastrados nesta disciplina."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
