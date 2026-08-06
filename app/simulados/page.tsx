"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, Filter, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { ContentCard, ContentCardSkeleton } from "@/components/ui/content-card";
import { FilterBar } from "@/components/ui/search-filter";
import { Paywall } from "@/components/ui/paywall";
import { useAuth } from "@/lib/hooks/use-auth";
import { useContentList } from "@/lib/hooks/use-content";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SimuladosPage() {
  const { profile } = useAuth(true);
  const { isPremium } = useAuthStore();
  const [search, setSearch] = useState("");
  const [ciclo, setCiclo] = useState("todos");
  const [sort, setSort] = useState("recent");

  const { contents, isLoading, error } = useContentList({ tipo: "simulado" });

  // Filter contents
  const filteredContents = contents
    .filter((c) => {
      if (search && !c.titulo.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (ciclo !== "todos" && c.ciclo !== ciclo) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "recent")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (sort === "popular") return b.visualizacoes - a.visualizacoes;
      return 0;
    });

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Simulados</h1>
              <p className="text-muted-foreground">
                Teste seus conhecimentos com Questões comentadas
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filter Bar */}
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
            sort: {
              value: sort,
              onChange: setSort,
              options: [
                { value: "recent", label: "Mais Recentes" },
                { value: "popular", label: "Mais Populares" },
              ],
            },
          }}
        />

        {/* Demo Section for Free Users */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-secondary/10 border border-secondary/20"
          >
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-secondary" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Experimente o simulado demo gratis!
                </p>
                <p className="text-xs text-muted-foreground">
                  10 Questões para conhecer a plataforma
                </p>
              </div>
              <Link href="/simulados/demo">
                <Button size="sm" variant="secondary">
                  Tentar Agora
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredContents.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredContents.map((content) => (
              <motion.div key={content.id} variants={fadeInUp}>
                <ContentCard content={content} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="p-12 text-center rounded-xl bg-card border border-border">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Nenhum simulado encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os filtros de busca
            </p>
          </div>
        )}

        {/* Premium Upsell */}
        {!isPremium && filteredContents.filter((c) => c.premium).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="font-semibold">
                  Desbloqueie todos os simulados
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filteredContents.filter((c) => c.premium).length} simulados
                  premium disponiveis
                </p>
              </div>
              <Link href="/planos">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Ver Planos Premium
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
