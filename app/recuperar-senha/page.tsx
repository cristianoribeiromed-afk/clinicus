"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Stethoscope, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { APP_CONFIG } from "@/lib/config";

export default function RecuperarSenhaPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      });
      if (error) throw error;
      // Sempre mostra sucesso, mesmo se o e-mail não existir na base --
      // não confirmar/negar existência de conta é uma prática de segurança
      // padrão (evita que alguém descubra quais e-mails têm conta testando
      // aqui).
      setEnviado(true);
    } catch (error) {
      toast({
        title: "Não foi possível enviar o e-mail",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
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
          <h1 className="text-2xl font-bold">Recuperar senha</h1>
          <p className="text-muted-foreground mt-2">
            {enviado
              ? "Confira sua caixa de entrada."
              : "Digite seu e-mail e enviamos um link pra você criar uma senha nova."}
          </p>
        </div>

        {enviado ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Se existir uma conta com o e-mail <strong className="text-foreground">{email}</strong>,
              você vai receber um link pra criar uma senha nova em alguns minutos.
              Não esqueça de olhar o spam.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar link de recuperação"}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
