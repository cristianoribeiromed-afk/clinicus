"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error Boundary do Next.js App Router. Sem esse arquivo, qualquer
 * erro não tratado durante a renderização de uma página derruba a
 * árvore de componentes inteira em silêncio -- o resultado visual é
 * uma área em branco, sem nenhum aviso na tela (só um erro minificado
 * no console, em produção, que muitas vezes nem aparece claro).
 *
 * Isso captura o erro, mostra uma tela explicando o que aconteceu (com
 * a mensagem real do erro, pra facilitar diagnóstico), e dá a opção de
 * tentar de novo -- em vez de silêncio total.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro capturado pelo Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-xl font-bold">Algo deu errado nessa página</h1>
        <p className="text-sm text-muted-foreground">
          {error.message || "Erro inesperado."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60">
            Código: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button onClick={reset}>Tentar de novo</Button>
          <Link href="/dashboard">
            <Button variant="outline">Voltar ao início</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
