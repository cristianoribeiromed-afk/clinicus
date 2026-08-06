"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Crown, ChevronDown } from "lucide-react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { ContentCard, ContentCardSkeleton } from "@/components/ui/content-card";
import { FilterBar } from "@/components/ui/search-filter";
import { useAuth } from "@/lib/hooks/use-auth";
import { useContentList } from "@/lib/hooks/use-content";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ResumosPage() {
  useAuth(true);
  const { isPremium } = useAuthStore();
  const [search, setSearch] = useState("");
  const [ciclo, setCiclo] = useState("todos");
  const [disciplina, setDisciplina] = useState("todas");
  // Qual semestre está aberto (accordion) -- só 1 por vez, o resto fica
  // fechado. Resolve a queixa de "muita coisa misturada, tem que rolar
  // demais": agora só o que interessa no momento fica visível.
  const [semestreAberto, setSemestreAberto] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const disciplinaUrl = params.get("disciplina");
    if (disciplinaUrl) setDisciplina(disciplinaUrl);
  }, []);

  const { contents, isLoading } = useContentList({ tipo: "resumo" });

  const filteredContents = contents.filter((c) => {
    if (search && !c.titulo.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (ciclo !== "todos" && c.ciclo !== ciclo) return false;
    if (disciplina !== "todas" && c.disciplina !== disciplina) return false;
    return true;
  });

  const agrupado = filteredContents.reduce<
    Record<string, Record<string, typeof filteredContents>>
  >((acc, item) => {
    const sem = item.semestre || "outros";
    const disc = item.disciplina || "Sem disciplina";
    if (!acc[sem]) acc[sem] = {};
    if (!acc[sem][disc]) acc[sem][disc] = [];
    acc[sem][disc].push(item);
    return acc;
  }, {});

  const semestresOrdenados = Object.keys(agrupado).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""), 10) || 999;
    const numB = parseInt(b.replace(/\D/g, ""), 10) || 999;
    return numA - numB;
  });

  // Abre automaticamente o semestre certo: se veio de um link de
  // disciplina específica (menu lateral), abre o semestre dessa
  // disciplina. Senão, abre o primeiro semestre que tem conteúdo.
  useEffect(() => {
    if (semestreAberto !== null || semestresOrdenados.length === 0) return;
    if (disciplina !== "todas") {
      const semDaDisciplina = semestresOrdenados.find((sem) =>
        Object.keys(agrupado[sem]).includes(disciplina),
      );
      setSemestreAberto(semDaDisciplina || semestresOrdenados[0]);
    } else {
      setSemestreAberto(semestresOrdenados[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semestresOrdenados.join(","), disciplina]);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold">Resumos</h1>
        </div>

        {!isPremium && (
          <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center gap-3">
            <Crown className="w-4 h-4 text-secondary flex-shrink-0" />
            <p className="text-xs flex-1">
              Plano Free inclui 2 resumos por disciplina.
            </p>
            <Link href="/planos">
              <Button size="sm" variant="secondary" className="h-7 text-xs">
                Ver Planos
              </Button>
            </Link>
          </div>
        )}

        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          filterOptions={{
            ciclo: {
              value: ciclo,
              onChange: setCiclo,
              options: [
                { value: "todos", label: "Todos os Ciclos" },
                { value: "basico", label: "Ciclo básico" },
                { value: "clinico", label: "Ciclo clínico" },
              ],
            },
          }}
          showSearch={true}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredContents.length > 0 ? (
          <div className="space-y-3">
            {semestresOrdenados.map((sem) => {
              const aberto = semestreAberto === sem;
              const totalItens = Object.values(agrupado[sem]).flat().length;
              return (
                <div
                  key={sem}
                  className="rounded-xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setSemestreAberto(aberto ? null : sem)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-card/80 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm flex-shrink-0">
                        {sem.replace("semestre-", "").replace(/^0/, "")}
                      </span>
                      {sem.replace("semestre-", "")}º Semestre
                      <span className="text-xs font-normal text-muted-foreground">
                        ({totalItens} {totalItens === 1 ? "item" : "itens"})
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${aberto ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {aberto && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-6 bg-background/40">
                          {Object.keys(agrupado[sem])
                            .sort((a, b) => a.localeCompare(b, "pt-BR"))
                            .map((disc) => (
                              <div key={disc} className="space-y-3">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                  {disc}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                  {agrupado[sem][disc].map((content) => (
                                    <ContentCard
                                      key={content.id}
                                      content={content}
                                      showDescription
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-xl bg-card border border-border">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Nenhum resumo encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os filtros de busca
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
