"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Crown } from "lucide-react";
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

  // Deep-link vindo do menu lateral (clicar numa disciplina real leva
  // pra cá já filtrado). Lido direto de window.location em vez de
  // useSearchParams() -- evita a exigencia de <Suspense> do Next.js
  // pra esse hook, que estava deixando a pagina em branco.
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

  const disciplinasDisponiveis = Array.from(
    new Set(contents.map((c) => c.disciplina)),
  );

  // Agrupa Semestre -> Matéria, na mesma lógica do Sidebar (ver
  // IDENTIDADE_CLINICUS.md: navegação segue a lógica real da Clinicus,
  // não uma lista plana de "produtos" misturados).
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

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Resumos</h1>
              <p className="text-muted-foreground">
                Conteudo organizado por disciplina com linguagem simplificada
              </p>
            </div>
          </div>
        </motion.div>

        {!isPremium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-secondary/10 border border-secondary/20"
          >
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-secondary" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Desbloqueie todos os resumos
                </p>
                <p className="text-xs text-muted-foreground">
                  Plano Free inclui 2 resumos por disciplina
                </p>
              </div>
              <Link href="/planos">
                <Button size="sm" variant="secondary">
                  Ver Planos
                </Button>
              </Link>
            </div>
          </motion.div>
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
          <div className="space-y-10">
            {semestresOrdenados.map((sem) => (
              <div key={sem} className="space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">
                    {sem.replace("semestre-", "").replace(/^0/, "")}
                  </span>
                  {sem.replace("semestre-", "")}º Semestre
                </h2>
                {Object.keys(agrupado[sem])
                  .sort((a, b) => a.localeCompare(b, "pt-BR"))
                  .map((disc) => (
                    <div key={disc} className="space-y-3 pl-2">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {disc}
                      </h3>
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                          visible: { transition: { staggerChildren: 0.03 } },
                        }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      >
                        {agrupado[sem][disc].map((content) => (
                          <motion.div key={content.id} variants={fadeInUp}>
                            <ContentCard content={content} showDescription />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  ))}
              </div>
            ))}
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
