'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DisciplineConfig } from '@/types';
import type { LucideIcon } from 'lucide-react';

interface DisciplinaCardProps {
  disciplina: DisciplineConfig;
  contentCount?: number;
  progress?: number;
  variant?: 'landing' | 'dashboard';
}

export function DisciplinaCard({
  disciplina,
  contentCount = 0,
  progress = 0,
  variant = 'landing',
}: DisciplinaCardProps) {
  const IconComponent = (Icons[disciplina.icon as keyof typeof Icons] || BookOpen) as LucideIcon;

  if (variant === 'dashboard') {
    return (
      <Link
        href={`/${disciplina.slug}`}
        className="group block"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="bg-card rounded-xl border border-border p-4 transition-all hover:border-primary/30"
        >
          <div className="flex items-center gap-4 mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${disciplina.color}20` }}
            >
              <IconComponent className="w-6 h-6" style={{ color: disciplina.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{disciplina.name}</h3>
              <p className="text-xs text-muted-foreground">{contentCount} conteudos</p>
            </div>
          </div>

          {/* Progress bar */}
          {progress > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: disciplina.color,
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={`/${disciplina.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group relative bg-card rounded-xl border border-border p-5 transition-all hover:border-primary/30 hover:shadow-glow"
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${disciplina.color}20` }}
        >
          <IconComponent className="w-7 h-7" style={{ color: disciplina.color }} />
        </div>

        {/* Name */}
        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
          {disciplina.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {disciplina.description}
        </p>

        {/* Content count */}
        {contentCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {contentCount} conteudos
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: disciplina.color }}
            >
              Ver mais
            </span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}

// Skeleton
export function DisciplinaCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-pulse">
      <div className="w-14 h-14 rounded-xl bg-muted mb-4" />
      <div className="h-5 w-24 bg-muted rounded mb-2" />
      <div className="h-3 w-full bg-muted rounded" />
    </div>
  );
}
