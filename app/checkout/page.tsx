"use client";

import { useState, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Check, ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import { PLANOS } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { profile, isAuthenticated } = useAuth();
  const { isPremium } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");

  const planId = searchParams.get("plan") as "monthly" | "annual" | null;
  const plan = PLANOS.find((p) => p.id === planId);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout?plan=" + (planId || ""));
    }
    if (isPremium) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isPremium, router, planId]);

  if (!plan || plan.id === "free") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Plano nao encontrado</h2>
          <Link href="/planos">
            <Button>Ver Planos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          plan_id: plan.id,
          user_id: profile.id,
          user_email: profile.email,
          payment_method: paymentMethod,
        }),
      });

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("Erro ao criar checkout");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Nao foi possivel iniciar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Finalizar Assinatura
            </h1>
            <p className="text-muted-foreground mb-8">
              Revise seu pedido e escolha a forma de pagamento
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="space-y-6"
            >
              <div className="p-6 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{plan.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {plan.interval === "year"
                        ? "Cobranca anual"
                        : "Cobranca mensal"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.slice(0, 5).map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-secondary mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-baseline justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold">
                        {plan.price_display}
                      </span>
                      {plan.interval && (
                        <span className="text-sm text-muted-foreground">
                          /{plan.interval === "month" ? "mes" : "ano"}
                        </span>
                      )}
                    </div>
                  </div>
                  {plan.discount && (
                    <p className="text-sm text-secondary text-right mt-1">
                      {plan.discount}
                    </p>
                  )}
                </div>
              </div>

              <Link
                href="/planos"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para planos
              </Link>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="space-y-6"
            >
              <div className="p-6 rounded-xl bg-card border border-border">
                <h3 className="font-semibold mb-4">Forma de Pagamento</h3>

                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod("pix")}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === "pix"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">PIX</p>
                        <p className="text-xs text-muted-foreground">
                          Aprovacao instantanea
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          paymentMethod === "pix"
                            ? "border-primary bg-primary"
                            : "border-border"
                        }`}
                      >
                        {paymentMethod === "pix" && (
                          <Check className="w-full h-full text-white p-0.5" />
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Cartao de Credito</p>
                        <p className="text-xs text-muted-foreground">
                          Processamento imediato
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary"
                            : "border-border"
                        }`}
                      >
                        {paymentMethod === "card" && (
                          <Check className="w-full h-full text-white p-0.5" />
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white mt-6 gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Finalizar Pagamento
                      <Crown className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Pagamento processado com seguranca pelo Mercado Pago
                </p>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Ao finalizar, você concorda com nossos{" "}
                <Link href="/termos" className="text-primary hover:underline">
                  Termos de Uso
                </Link>{" "}
                e{" "}
                <Link
                  href="/privacidade"
                  className="text-primary hover:underline"
                >
                  Politica de Privacidade
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <p className="text-center pt-20">Carregando...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
