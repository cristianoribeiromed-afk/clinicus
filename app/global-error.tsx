"use client";

import { useEffect } from "react";

/**
 * Error Boundary de último recurso -- pega erros até no root layout
 * (app/layout.tsx), onde o error.tsx normal não alcança. Precisa
 * renderizar <html>/<body> própria porque substitui o layout inteiro
 * quando ativado.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro capturado pelo Global Error Boundary:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: "system-ui, sans-serif",
            background: "#0a0a0a",
            color: "#fafafa",
          }}
        >
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>
              Algo deu errado ao carregar a Clinicus
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#a1a1aa", marginBottom: 16 }}>
              {error.message || "Erro inesperado no carregamento."}
            </p>
            {error.digest && (
              <p style={{ fontSize: "0.75rem", color: "#71717a", marginBottom: 16 }}>
                Código: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                background: "#22c55e",
                color: "#0a0a0a",
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Tentar de novo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
