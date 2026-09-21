"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Stethoscope, BookOpen } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { FilterBar } from "@/components/ui/search-filter";
import { useAuth } from "@/lib/hooks/use-auth";
import { useDisciplinasVitrine } from "@/lib/hooks/use-disciplinas-vitrine";
import { useUniversidade, ehDisciplinaCDE } from "@/lib/providers/universidade-provider";
import { accentForDisciplina } from "@/components/ui/content-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

function DisciplinaCard({ d }: { d: ReturnType<typeof useDisciplinasVitrine>["disciplinas"][number] }) {
  const accent = accentForDisciplina(d.disciplina);
  return (
    <Link
      href={`/disciplinas/${encodeURIComponent(d.disciplina)}`}
      className="group flex flex-col rounded-xl border border-border bg-card hover:border-white/20 hover:bg-white/[0.02] transition-colors p-4"
    >
      {/* 1. Nome — maior peso do card */}
      <h3 className="font-semibold text-[0.95rem] leading-snug group-hover:text-primary transition-colors">
        {d.disciplina}
      </h3>
      {/* 2. Contexto */}
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        <span className="text-xs text-muted-foreground capitalize">
          {d.ciclo ? `Ciclo ${d.ciclo}` : "Ciclo não classificado"} · {d.numeroSemestre}º semestre
        </span>
      </div>
      {/* 3. Recursos reais */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2.5">
        {d.totalResumos > 0 && <span>{d.totalResumos} resumos</span>}
        {d.totalCasos > 0 && <span>{d.totalCasos} casos clínicos</span>}
        {d.totalSimulados > 0 && <span>{d.totalSimulados} simulados</span>}
      </div>
      {/* 4. Ação */}
      <span className="mt-3 text-xs font-medium text-primary flex items-center gap-1">
        Explorar disciplina
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </Link>
  );
}

export default function DisciplinasPage() {
  useAuth(true);
  const [busca, setBusca] = useState("");
  const { disciplinas, isLoading, error, refetch } = useDisciplinasVitrine();
  const { universidade, esquecerUniversidade } = useUniversidade();

  const disciplinasDaUniversidade = useMemo(() => {
    if (!universidade) return [];
    return disciplinas.filter((d) =>
      universidade === "cde" ? ehDisciplinaCDE(d.disciplina) : !ehDisciplinaCDE(d.disciplina),
    );
  }, [disciplinas, universidade]);

  // "básico"/"clínico" (com acento) são os únicos valores que o banco aceita
  // (CHECK constraint em conteudos.ciclo). A classificação em si vem de uma
  // heurística por semestre, feita na importação do conteúdo legado, nunca
  // confirmada pela fonte original (ver P46 em DECISIONS.md) -- é dado real
  // da coluna, não inventado aqui, mas com essa ressalva conhecida.
  const ciclosDisponiveis = useMemo(() => {
    const presentes = new Set(disciplinasDaUniversidade.map((d) => d.ciclo).filter(Boolean) as string[]);
    // Básico antes de Clínico quando os dois existem, já que é a ordem
    // natural da graduação -- não é alfabético à toa.
    return Array.from(presentes).sort((a, b) => (a === "básico" ? -1 : 1));
  }, [disciplinasDaUniversidade]);

  const [cicloAtivo, setCicloAtivo] = useState<string | null>(null);
  useEffect(() => {
    // Assim que os dados chegam (ou a universidade muda), ativa o primeiro
    // ciclo disponível -- a tela nunca fica sem nenhum ciclo selecionado.
    setCicloAtivo(ciclosDisponiveis[0] ?? null);
  }, [ciclosDisponiveis]);

  const doCiclo = useMemo(
    () => disciplinasDaUniversidade.filter((d) => !cicloAtivo || d.ciclo === cicloAtivo),
    [disciplinasDaUniversidade, cicloAtivo],
  );

  const semestresDoCiclo = useMemo(() => {
    const nums = new Set(doCiclo.map((d) => d.numeroSemestre));
    return Array.from(nums).sort((a, b) => a - b);
  }, [doCiclo]);

  const [semestreAtivo, setSemestreAtivo] = useState<number | null>(null);
  useEffect(() => {
    // Troca de ciclo sempre reseta pro primeiro semestre daquele ciclo --
    // nunca fica um semestre do ciclo anterior selecionado por engano.
    setSemestreAtivo(semestresDoCiclo[0] ?? null);
  }, [cicloAtivo, semestresDoCiclo]);

  // Buscar texto ignora a aba de semestre de propósito: procurar algo
  // específico não deveria depender de já estar no semestre certo -- só
  // continua respeitando o ciclo ativo, pra não misturar Básico e Clínico
  // numa busca só.
  const estaBuscando = busca.trim().length > 0;
  const listaExibida = estaBuscando
    ? doCiclo.filter((d) => d.disciplina.toLowerCase().includes(busca.toLowerCase()))
    : doCiclo.filter((d) => d.numeroSemestre === semestreAtivo);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">Disciplinas</h1>
              <p className="text-sm text-muted-foreground">
                {universidade === "cde" ? "UCP — Ciudad del Este" : "Universidad Interamericana"}
              </p>
            </div>
          </div>
          <button
            onClick={esquecerUniversidade}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 flex-shrink-0"
          >
            Trocar universidade
          </button>
        </div>

        {/* Ciclo — sempre um ativo, sem opção "Todos". Só aparece o
            alternador se houver mais de um ciclo nos dados reais. */}
        {ciclosDisponiveis.length > 1 && (
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-card border border-border">
            {ciclosDisponiveis.includes("básico") && (
              <button
                onClick={() => setCicloAtivo("básico")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                  cicloAtivo === "básico"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Ciclo Básico
              </button>
            )}
            {ciclosDisponiveis.includes("clínico") && (
              <button
                onClick={() => setCicloAtivo("clínico")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                  cicloAtivo === "clínico"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                Ciclo Clínico
              </button>
            )}
          </div>
        )}

        <FilterBar searchValue={busca} onSearchChange={setBusca} showSearch />

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, j) => (
                <DisciplinaCardSkeleton key={j} />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center rounded-xl bg-card border border-border">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Não foi possível carregar as disciplinas</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button size="sm" onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Abas de semestre — só dentro do ciclo ativo, um de cada vez,
                pra não empilhar tudo verticalmente. Somem durante a busca,
                já que buscar cruza os semestres do ciclo inteiro. */}
            {!estaBuscando && semestresDoCiclo.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {semestresDoCiclo.map((num) => (
                  <button
                    key={num}
                    onClick={() => setSemestreAtivo(num)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors flex-shrink-0",
                      semestreAtivo === num
                        ? "bg-card border border-border text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {num}º Semestre
                  </button>
                ))}
              </div>
            )}

            {estaBuscando && (
              <h2 className="text-sm font-semibold text-muted-foreground">
                Resultado da busca no {cicloAtivo === "clínico" ? "Ciclo Clínico" : "Ciclo Básico"}
              </h2>
            )}

            {listaExibida.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {listaExibida.map((d) => (
                  <DisciplinaCard key={d.disciplina} d={d} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-xl bg-card border border-border">
                <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Nenhuma disciplina encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  {estaBuscando ? "Tente ajustar a busca" : "Nada cadastrado neste semestre ainda"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
