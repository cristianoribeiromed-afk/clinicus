"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Filter, Crown } from "lucide-react";
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

export default function CasosPage() {
  useAuth(true);
  const { isPremium } = useAuthStore();
  const [search, setSearch] = useState("");
  const [ciclo, setCiclo] = useState("todos");

  const { contents, isLoading, error, refetch } = useContentList({ tipo: "caso_clinico" });

  const filteredContents = contents.filter((c) => {
    if (search && !c.titulo.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (ciclo !== "todos" && c.ciclo !== ciclo) return false;
    return true;
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
            <div className="p-2 rounded-lg bg-rose-500/20">
              <Heart className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Casos clínicos</h1>
              <p className="text-muted-foreground">
                Aprimore seu raciocinio clínico com casos comentados
              </p>
            </div>
          </div>
        </motion.div>

        {!isPremium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-primary/10 border border-primary/20"
          >
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Todos os casos clínicos são exclusivos Premium
                </p>
                <p className="text-xs text-muted-foreground">
                  Assine para acessar conteudo completo
                </p>
              </div>
              <Link href="/planos">
                <Button size="sm">Ver Planos</Button>
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
        ) : error ? (
          <div className="p-12 text-center rounded-xl bg-card border border-border">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Não foi possível carregar os casos</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button size="sm" onClick={() => refetch()}>Tentar novamente</Button>
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
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Nenhum caso encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os filtros de busca
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
