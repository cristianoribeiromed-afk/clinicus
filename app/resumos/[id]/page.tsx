"use client";

import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Paywall } from "@/components/ui/paywall";
import { useAuth } from "@/lib/hooks/use-auth";
import { useContentAccess } from "@/lib/hooks/use-content";
import { ContentSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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

  // Quando o conteúdo já vem como HTML embutido (file_url ou conteudo_html),
  // ele já traz o próprio título/cabeçalho (ex: template ClinicusMed) — repetir
  // aqui em cima duplicava a informação e empurrava o conteúdo real pra baixo.
  // Ver IDENTIDADE_CLINICUS.md: essas páginas não são reescritas, então o
  // cabeçalho do React precisa ceder espaço pra elas, não competir.
  const temConteudoProprio = !!(content.file_url || content.conteudo_html);

  return (
    <AppLayout>
      <div className="relative p-2 lg:p-3">
        {/* "Voltar" flutua sobre o conteúdo em vez de ocupar uma barra
            inteira própria -- o conteúdo embutido já tem seu próprio
            cabeçalho completo (Sair do modo leitura, tema, etc.); duas
            barras de topo lado a lado é o que mais dava a sensação de
            "duas coisas empilhadas". Isso vira só um botão pequeno no
            canto, não mais uma faixa competindo com a deles. */}
        <Link
          href="/resumos"
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border text-xs text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar
        </Link>

        {/* Título só aparece quando não há HTML embutido (que já traz o próprio) */}
        {!temConteudoProprio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 pt-12"
          >
            <h1 className="text-2xl lg:text-3xl font-bold">{content.titulo}</h1>
            {content.descricao && (
              <p className="text-muted-foreground mt-1">{content.descricao}</p>
            )}
          </motion.div>
        )}

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
              className="rounded-lg overflow-hidden bg-background"
              style={{ height: "calc(100vh - 70px)", minHeight: 600 }}
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
