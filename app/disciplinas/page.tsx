"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { FilterBar } from "@/components/ui/search-filter";
import { useAuth } from "@/lib/hooks/use-auth";
import { useDisciplinasVitrine } from "@/lib/hooks/use-disciplinas-vitrine";
import { accentForDisciplina } from "@/components/ui/content-card";
import { Button } from "@/components/ui/button";

function DisciplinaCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-pulse">
      <div className="h-3 w-16 bg-muted rounded" />
      <div className="h-5 w-2/3 bg-muted rounded" />
      <div className="h-3 w-full bg-muted rounded" />
      <div className="h-3 w-1/3 bg-muted rounded" />
    </div>
  );
}

export default function DisciplinasPage() {
  useAuth(true);
  const [busca, setBusca] = useState("");
  const { disciplinas, isLoading, error, refetch } = useDisciplinasVitrine();

  const filtradas = disciplinas.filter((d) =>
    d.disciplina.toLowerCase().includes(busca.toLowerCase()),
  );

  const porSemestre = filtradas.reduce<Record<number, typeof filtradas>>(
    (acc, d) => {
      if (!acc[d.numeroSemestre]) acc[d.numeroSemestre] = [];
      acc[d.numeroSemestre].push(d);
      return acc;
    },
    {},
  );
  const semestresOrdenados = Object.keys(porSemestre)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">Disciplinas</h1>
            <p className="text-sm text-muted-foreground">
              Encontre sua disciplina e veja tudo que já está disponível
            </p>
          </div>
        </div>

        <FilterBar
          searchValue={busca}
          onSearchChange={setBusca}
          showSearch
        />

        {isLoading ? (
          <div className="space-y-6">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(3)].map((_, j) => (
                    <DisciplinaCardSkeleton key={j} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center rounded-xl bg-card border border-border">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Não foi possível carregar as disciplinas</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button size="sm" onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        ) : semestresOrdenados.length > 0 ? (
          <div className="space-y-6">
            {semestresOrdenados.map((num) => (
              <div key={num} className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  {num}º Semestre
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {porSemestre[num].map((d) => {
                    const accent = accentForDisciplina(d.disciplina);
                    return (
                      <Link
                        key={d.disciplina}
                        href={`/disciplinas/${encodeURIComponent(d.disciplina)}`}
                        className="group flex flex-col gap-2.5 rounded-xl border border-border bg-card hover:border-white/20 hover:bg-white/[0.02] transition-colors p-4"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: accent }}
                          aria-hidden
                        />
                        <h3 className="font-semibold text-[0.95rem] leading-snug group-hover:text-primary transition-colors">
                          {d.disciplina}
                        </h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {d.totalResumos > 0 && <span>{d.totalResumos} resumos</span>}
                          {d.totalCasos > 0 && <span>{d.totalCasos} casos clínicos</span>}
                          {d.totalSimulados > 0 && <span>{d.totalSimulados} simulados</span>}
                        </div>
                        <span className="mt-1 text-xs font-medium text-primary flex items-center gap-1">
                          Explorar disciplina
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-xl bg-card border border-border">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Nenhuma disciplina encontrada</h3>
            <p className="text-sm text-muted-foreground">
              Tente ajustar a busca
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
