"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Stethoscope, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { APP_CONFIG } from "@/lib/config";

export default function AtualizarSenhaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessaoPronta, setSessaoPronta] = useState(false);
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    // O cliente Supabase (lib/supabase.ts, detectSessionInUrl: true) já
    // processa sozinho o token que vem no link do e-mail assim que a
    // página carrega, abrindo uma sessão temporária de recuperação. Só
    // confere que ela existe antes de liberar o formulário -- se o aluno
    // abriu essa página sem vir de um link válido, não tem sessão nenhuma.
    let cancelado = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelado) setSessaoPronta(!!data.session);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmar) {
      toast({
        title: "As senhas não conferem",
        variant: "destructive",
      });
      return;
    }
    if (senha.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "Use pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      setConcluido(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error) {
      toast({
        title: "Não foi possível atualizar a senha",
        description:
          error instanceof Error ? error.message : "Tente pedir o link de novo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">
              {APP_CONFIG.name}
            </span>
          </Link>
          <h1 className="text-2xl font-bold">Criar senha nova</h1>
        </div>

        {concluido ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">
              Senha atualizada. Te levando pro Dashboard...
            </p>
          </div>
        ) : !sessaoPronta ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Esse link não é mais válido, ou expirou. Pede um novo pra
              trocar sua senha.
            </p>
            <Link href="/recuperar-senha">
              <Button className="w-full">Pedir novo link</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="senha">Senha nova</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmar">Confirmar senha nova</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmar"
                  type="password"
                  placeholder="••••••••"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar senha nova"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
