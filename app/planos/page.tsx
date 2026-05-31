'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Crown, Check, ArrowRight, Shield, CreditCard } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PlanCard } from '@/components/ui/plan-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { useAuthStore } from '@/lib/auth-store';
import { PLANOS } from '@/lib/config';

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

function PlanosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, isAuthenticated } = useAuth();
  const { isPremium } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(searchParams.get('plan'));
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      router.push('/login');
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?redirect=/checkout?plan=${planId}`);
      return;
    }

    router.push(`/checkout?plan=${planId}`);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center mb-12">
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Planos Premium</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              Escolha o plano ideal para voce
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto">
              Comece gratis ou desbloqueie todos os recursos com uma assinatura premium. Cancele quando quiser.
            </motion.p>
          </motion.div>

          {isPremium && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-secondary" />
                <span className="font-semibold">Voce ja possui um plano Premium</span>
              </div>
              <p className="text-sm text-muted-foreground">Seu plano atual: {profile?.plan === 'annual' ? 'Anual' : 'Mensal'}</p>
              <Link href="/dashboard" className="mt-3 inline-block">
                <Button variant="secondary" className="gap-2">
                  Ir para Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          )}

          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center mb-12">
            {PLANOS.map((p) => (
              <motion.div key={p.id} variants={fadeInUp}>
                <PlanCard
                  plan={p}
                  onSelect={() => handleSelectPlan(p.id)}
                  isCurrentPlan={isPremium && (profile?.plan === p.id || (p.id === 'monthly' && profile?.plan === 'annual'))}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Payment Info */}
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div variants={fadeInUp} className="p-4 rounded-xl bg-card border border-border">
                <CreditCard className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Pagamento Seguro</h3>
                <p className="text-xs text-muted-foreground">ACEITAMOS PIX APROVACAO INSTANTANEA, cartao de credito e debito via Mercado Pago</p>
              </motion.div>
              <motion.div variants={fadeInUp} className="p-4 rounded-xl bg-card border border-border">
                <Shield className="w-6 h-6 text-secondary mb-3" />
                <h3 className="font-semibold mb-1">Garantia de 7 dias</h3>
                <p className="text-xs text-muted-foreground">Se nao estiver satisfeito, devolvemos 100% do seu dinheiro em ate 7 dias</p>
              </motion.div>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-16 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold">Perguntas Frequentes</h2>
            </div>
            <div className="space-y-4">
              {[
                { q: 'Quais formas de pagamento sao aceitas?', a: 'Aceitamos PIX com aprovacao instantanea, alem de cartao de credito e debito atraves do Mercado Pago, garantindo seguranca total.' },
                { q: 'Posso cancelar a qualquer momento?', a: 'Sim! Voce pode cancelar sua assinatura quando quiser. O acesso continua ativo ate o final do periodo ja pago.' },
                { q: 'O acesso e imediato?', a: 'Sim! Para pagamentos via PIX, o acesso e liberado instantaneamente. Para cartao, em poucos segundos apos a aprovacao.' },
                { q: 'Existe garantia?', a: 'Oferecemos garantia de 7 dias. Se nao estiver satisfeito, devolvemos 100% do valor.' },
              ].map((faq, index) => (
                <div key={index} className="p-4 rounded-xl bg-card border border-border">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PlanosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background"><p className="text-center pt-20">Carregando...</p></div>}>
      <PlanosContent />
    </Suspense>
  );
}
