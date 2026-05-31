'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString('pt-BR')}{suffix}
    </span>
  );
}

export function StatCard({ value, suffix = '', prefix = '', label, icon, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'bg-card rounded-xl border border-border p-6 text-center hover:border-primary/30 transition-all',
        className
      )}
    >
      {icon && (
        <div className="flex justify-center mb-4 text-primary">{icon}</div>
      )}
      <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
        <AnimatedNumber value={value} suffix={suffix} prefix={prefix} />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}

// Progress bar component
export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  size = 'default',
  className,
}: {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    default: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Progresso</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={cn('bg-muted rounded-full overflow-hidden', sizeClasses[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
        />
      </div>
    </div>
  );
}

// Streak flame animation
export function StreakIndicator({ days }: { days: number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-2xl"
        >
          {days > 0 ? '🔥' : '⚡'}
        </motion.div>
      </div>
      <div>
        <span className="text-xl font-bold">{days}</span>
        <p className="text-xs text-muted-foreground">dias seguidos</p>
      </div>
    </div>
  );
}
