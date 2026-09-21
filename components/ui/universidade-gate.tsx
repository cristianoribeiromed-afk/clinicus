"use client";

import { ReactNode } from "react";
import { GraduationCap, Stethoscope } from "lucide-react";
import { useUniversidade, type Universidade } from "@/lib/providers/universidade-provider";
import { APP_CONFIG } from "@/lib/config";

const OPCOES: Array<{
  valor: Universidade;
  nome: string;
  icon: typeof GraduationCap;
  accent: string;
}> = [
  {
    valor: "interamericana",
    nome: "Universidad Interamericana",
    icon: GraduationCap,
    accent: "#18B6A4",
  },
  {
    valor: "cde",
    nome: "UCP — Ciudad del Este",
    icon: Stethoscope,
    accent: "#3B82F6",
  },
];

/**
 * Envolve o app autenticado inteiro. Enquanto o aluno não escolheu a
 * universidade, mostra só esta tela -- nada de sidebar, nada de header,
 * nenhum conteúdo por trás. É a primeira coisa que aparece depois do
 * login, não um filtro dentro de uma página de conteúdo.
 */
export function UniversidadeGate({ children }: { children: ReactNode }) {
  const { universidade, carregado, escolherUniversidade } = useUniversidade();

  // Evita um flash da tela de escolha antes do localStorage ser lido.
  if (!carregado) return null;

  if (universidade) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Bem-vindo ao {APP_CONFIG.name}</h1>
          <p className="text-muted-foreground mt-2">
            Pra te mostrar as disciplinas certas, diz pra gente onde você estuda.
          </p>
        </div>

        <div className="space-y-3">
          {OPCOES.map((op) => (
            <button
              key={op.valor}
              onClick={() => escolherUniversidade(op.valor)}
              className="group w-full flex items-center gap-4 text-left rounded-2xl border border-border bg-card p-5 hover:border-white/20 hover:bg-white/[0.03] transition-colors"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${op.accent}1A` }}
              >
                <op.icon className="w-5 h-5" style={{ color: op.accent }} />
              </div>
              <span className="font-semibold text-[0.95rem] group-hover:text-primary transition-colors">
                {op.nome}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
