"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Check, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaywallProps {
  title?: string;
  description?: string;
  features?: string[];
  ctaText?: string;
  showOverlay?: boolean;
}

const defaultFeatures = [
  "Acesso a todos os resumos",
  "Simulados ilimitados com gabarito",
  "Todos os casos clínicos comentados",
  "Estatisticas avancadas de desempenho",
];

export function Paywall({
  title = "Conteudo Premium",
  description = "Este conteudo e exclusivo para assinantes Premium. Assine agora e tenha acesso completo a plataforma.",
  features = defaultFeatures,
  ctaText = "Assinar Premium",
  showOverlay = true,
}: PaywallProps) {
  return (
    <div className="relative">
      {showOverlay && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-xl" />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative z-20 p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-primary/20",
          showOverlay && "absolute inset-0 m-auto h-fit max-w-md",
        )}
      >
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-2">{title}</h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6">{description}</p>

          {/* Features */}
          <ul className="space-y-3 mb-8 text-left">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-secondary" />
                </div>
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link href="/planos">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white gap-2">
              <Crown className="w-4 h-4" />
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          {/* Link */}
          <p className="mt-4 text-xs text-muted-foreground">
            Ja tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Faca login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Blurred preview component
export function PaywallPreview({
  children,
  isPremium,
  blur = true,
}: {
  children: React.ReactNode;
  isPremium: boolean;
  blur?: boolean;
}) {
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className={blur ? "blur-sm pointer-events-none select-none" : ""}>
        {children}
      </div>
      <div className="absolute inset-0 z-10">
        <Paywall />
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
