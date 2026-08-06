"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/layout/app-layout";
import { BookOpen, FileText, Stethoscope } from "lucide-react";

/**
 * Dashboard reescrito do zero (ver conversa: várias tentativas de
 * corrigir a versão anterior não resolveram uma tela em branco
 * persistente, sem erro visível nem no console nem no Error Boundary).
 *
 * Princípios dessa versão, todos deliberados:
 * 1. Autenticação verificada AQUI DENTRO, direto, sem depender da
 *    cadeia de hooks compartilhados (useAuth -> useAuthStore ->
 *    persist -> ...) que pode ter algum ponto de falha silenciosa
 *    ainda não identificado.
 * 2. Todo estado (carregando / erro / vazio / com dado) tem uma
 *    UI DISTINTA E VISÍVEL -- nunca um "esqueleto" com cor parecida
 *    com o fundo, que pode parecer tela em branco por engano.
 * 3. Um console.log de cada etapa -- fácil de (I) confirmar que o
 *    componente pelo menos MONTOU, e (II) ver exatamente onde parou,
 *    se parar.
 */

interface DashboardData {
  nome: string;
  email: string;
  plano: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"carregando" | "erro" | "pronto">(
    "carregando",
  );
  const [erro, setErro] = useState<string>("");
  const [dados, setDados] = useState<DashboardData | null>(null);

  useEffect(() => {
    console.log("[Dashboard] montou, iniciando verificação de sessão...");
    let ativo = true;

    async function carregar() {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        console.log("[Dashboard] getSession retornou:", {
          temSessao: !!sessionData?.session,
          erro: sessionError,
        });

        if (sessionError) throw sessionError;

        if (!sessionData?.session) {
          console.log("[Dashboard] sem sessão, redirecionando pro login");
          if (ativo) router.push("/login");
          return;
        }

        const userId = sessionData.session.user.id;
        const { data: userRow, error: userError } = await supabase
          .from("users")
          .select("name, email, plan")
          .eq("id", userId)
          .maybeSingle();

        console.log("[Dashboard] busca de perfil retornou:", {
          userRow,
          userError,
        });

        if (userError) throw userError;

        if (ativo) {
          setDados({
            nome: (userRow as any)?.name || sessionData.session.user.email || "Aluno",
            email: sessionData.session.user.email || "",
            plano: (userRow as any)?.plan || "free",
          });
          setStatus("pronto");
        }
      } catch (err) {
        console.error("[Dashboard] erro ao carregar:", err);
        if (ativo) {
          const codigo = (err as any)?.code;
          if (codigo === "PGRST303") {
            setErro(
              "O relógio do seu computador parece estar desconfigurado, o que impede o login de ser validado. Verifique se a data/hora do seu dispositivo está com 'ajuste automático' ativado, depois recarregue a página.",
            );
          } else {
            setErro(
              err instanceof Error ? err.message : "Erro desconhecido ao carregar o dashboard.",
            );
          }
          setStatus("erro");
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [router]);

  if (status === "carregando") {
    return (
      <AppLayout>
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando sua jornada...</p>
        </div>
      </AppLayout>
    );
  }

  if (status === "erro") {
    return (
      <AppLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md text-center space-y-4 bg-card border border-destructive/30 rounded-xl p-6">
            <p className="text-base font-semibold text-destructive">
              Não foi possível carregar o dashboard
            </p>
            <p className="text-sm text-muted-foreground">{erro}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              Tentar de novo
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Olá, {dados?.nome?.split(" ")[0]} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plano atual: <span className="capitalize">{dados?.plano}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/resumos"
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors flex items-center gap-4"
          >
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Guias de Estudo</p>
              <p className="text-xs text-muted-foreground">Continue seus estudos</p>
            </div>
          </Link>

          <Link
            href="/simulados"
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors flex items-center gap-4"
          >
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Simulados</p>
              <p className="text-xs text-muted-foreground">Teste seu conhecimento</p>
            </div>
          </Link>

          <Link
            href="/casos"
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors flex items-center gap-4"
          >
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Casos Clínicos</p>
              <p className="text-xs text-muted-foreground">Pratique raciocínio clínico</p>
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
