'use client';

import { motion } from 'framer-motion';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { PlanConfig } from '@/types';

interface PlanCardProps {
  plan: PlanConfig;
  onSelect: () => void;
  isLoading?: boolean;
  isCurrentPlan?: boolean;
}

export function PlanCard({
  plan,
  onSelect,
  isLoading = false,
  isCurrentPlan = false,
}: PlanCardProps) {
  const isFree = plan.id === 'free';
  const isPopular = plan.highlighted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative rounded-2xl p-6 transition-all duration-300',
        isPopular
          ? 'bg-gradient-to-b from-primary/10 to-card border-2 border-primary/50 scale-105'
          : 'bg-card border border-border hover:border-primary/30'
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="px-4 py-1.5 bg-primary rounded-full text-white text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Mais Popular
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div
          className={cn(
            'inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4',
            isPopular
              ? 'bg-primary text-white'
              : isFree
              ? 'bg-muted text-muted-foreground'
              : 'bg-secondary/20 text-secondary'
          )}
        >
          {isFree ? (
            <Zap className="w-7 h-7" />
          ) : (
            <Crown className="w-7 h-7" />
          )}
        </div>
        <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold">{plan.price_display}</span>
          {plan.interval && (
            <span className="text-muted-foreground">/{plan.interval === 'month' ? 'mes' : 'ano'}</span>
          )}
        </div>
        {plan.discount && (
          <p className="text-sm text-secondary font-medium mt-1">{plan.discount}</p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Check className={cn('w-3 h-3', isPopular ? 'text-primary' : 'text-secondary')} />
            </div>
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        onClick={onSelect}
        disabled={isLoading || isCurrentPlan}
        className={cn(
          'w-full gap-2',
          isPopular
            ? 'bg-primary hover:bg-primary/90 text-white'
            : 'bg-card hover:bg-card/80 border border-border'
        )}
        variant={isPopular ? 'default' : 'outline'}
      >
        {isLoading ? (
          <span className="animate-pulse">Processando...</span>
        ) : isCurrentPlan ? (
          'Plano Atual'
        ) : isFree ? (
          'Comecar Gratis'
        ) : (
          <>
            <Crown className="w-4 h-4" />
            Assinar Agora
          </>
        )}
      </Button>
    </motion.div>
  );
}

// Skeleton version
export function PlanCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 bg-card border border-border animate-pulse">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-muted" />
      </div>
      <div className="h-6 w-24 bg-muted rounded mx-auto mb-2" />
      <div className="h-8 w-32 bg-muted rounded mx-auto mb-4" />
      <div className="space-y-3 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 w-3/4 bg-muted rounded" />
        ))}
      </div>
      <div className="h-10 bg-muted rounded" />
    </div>
  );
}
