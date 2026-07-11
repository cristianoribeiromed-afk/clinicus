"use client";

import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Paywall } from "@/components/ui/paywall";
import { useAuth } from "@/lib/hooks/use-auth";
import { useContentAccess } from "@/lib/hooks/use-content";
import { ContentSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export default function ResumoPage() {
  const params = useParams();
  const resumoId = params.id as string;

  const { isLoading: authLoading } = useAuth(true);
  const { content, hasAccess, isLoading } = useContentAccess(resumoId);

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
          <h2 className="text-xl font-semibold mb-4">Resumo não encontrado</h2>
          <Link href="/resumos">
            <Button variant="outline">Voltar para Resumos</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link
            href="/resumos"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Resumos
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm text-primary font-medium">Resumo</span>
            <span className="text-sm text-muted-foreground">{content.disciplina}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold">{content.titulo}</h1>
          {content.descricao && (
            <p className="text-muted-foreground mt-1">{content.descricao}</p>
          )}
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
                title="Resumo Premium"
                description="Este resumo interativo completo está disponível para assinantes."
                ctaText="Assinar para Acessar"
              />
            </motion.div>
          ) : content.file_url ? (
            <motion.div
              key="iframe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl overflow-hidden border border-border bg-white"
              style={{ height: "calc(100vh - 260px)", minHeight: 600 }}
            >
              <iframe
                src={content.file_url}
                title={content.titulo}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </motion.div>
          ) : content.conteudo_html ? (
            <motion.div
              key="html"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-border bg-card p-6 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content.conteudo_html }}
            />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              Este resumo ainda não tem conteúdo cadastrado.
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
