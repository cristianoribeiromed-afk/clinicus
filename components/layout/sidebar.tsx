'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  Brain,
  FileText,
  Heart,
  Star,
  User,
  Crown,
  ChevronDown,
  Menu,
  X,
  Stethoscope,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DISCIPLINAS, APP_CONFIG } from '@/lib/config';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: FileText, label: 'Resumos', href: '/resumos' },
  { icon: Brain, label: 'Simulados', href: '/simulados' },
  { icon: Heart, label: 'Casos Clinicos', href: '/casos' },
  { icon: Star, label: 'Favoritos', href: '/favoritos' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, isPremium } = useAuthStore();
  const [expandedCiclo, setExpandedCiclo] = useState<'basico' | 'clinico' | null>(null);

  const disciplinasBasico = DISCIPLINAS.filter((d) => d.ciclo === 'basico');
  const disciplinasClinico = DISCIPLINAS.filter((d) => d.ciclo === 'clinico');

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-background border-r border-border glass">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">{APP_CONFIG.name}</span>
        </Link>
      </div>

      {/* User Profile */}
      {profile && (
        <div className="px-4 mb-6">
          <div className="p-3 rounded-lg bg-card flex items-center gap-3">
            <Avatar>
              <AvatarImage src={profile.photo_url || undefined} />
              <AvatarFallback className="bg-primary text-white">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.name}</p>
              <div className="flex items-center gap-1">
                {isPremium ? (
                  <span className="text-xs text-secondary flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Plano Free</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-card hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        {/* Ciclo Básico */}
        <div className="pt-4">
          <button
            onClick={() => setExpandedCiclo(expandedCiclo === 'basico' ? null : 'basico')}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Ciclo Basico
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                expandedCiclo === 'basico' && 'rotate-180'
              )}
            />
          </button>
          {expandedCiclo === 'basico' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-1 space-y-0.5 pl-2"
            >
              {disciplinasBasico.slice(0, 6).map((disc) => (
                <Link
                  key={disc.slug}
                  href={`/${disc.slug}`}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all',
                    pathname === `/${disc.slug}`
                      ? 'bg-card text-foreground'
                      : 'text-muted-foreground hover:bg-card hover:text-foreground'
                  )}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: disc.color }}
                  />
                  {disc.name}
                </Link>
              ))}
            </motion.div>
          )}
        </div>

        {/* Ciclo Clínico */}
        <div className="pt-2">
          <button
            onClick={() => setExpandedCiclo(expandedCiclo === 'clinico' ? null : 'clinico')}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Ciclo Clinico
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                expandedCiclo === 'clinico' && 'rotate-180'
              )}
            />
          </button>
          {expandedCiclo === 'clinico' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-1 space-y-0.5 pl-2"
            >
              {disciplinasClinico.map((disc) => (
                <Link
                  key={disc.slug}
                  href={`/${disc.slug}`}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all',
                    pathname === `/${disc.slug}`
                      ? 'bg-card text-foreground'
                      : 'text-muted-foreground hover:bg-card hover:text-foreground'
                  )}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: disc.color }}
                  />
                  {disc.name}
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </nav>

      {/* Upgrade CTA for free users */}
      {!isPremium && (
        <div className="p-4">
          <Link
            href="/planos"
            className="block p-4 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-primary" />
              <span className="font-semibold">Upgrade Premium</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Acesse todos os conteudos, simulados ilimitados e mais.
            </p>
          </Link>
        </div>
      )}

      {/* Profile Link */}
      <div className="p-4 border-t border-border">
        <Link
          href="/perfil"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
            pathname === '/perfil'
              ? 'bg-card text-foreground'
              : 'text-muted-foreground hover:bg-card hover:text-foreground'
          )}
        >
          <User className="w-5 h-5" />
          Meu Perfil
        </Link>
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { profile } = useAuthStore();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 glass border-b border-border">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gradient">{APP_CONFIG.name}</span>
          </Link>
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg hover:bg-card transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-background/90 glass"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="lg:hidden fixed right-0 top-0 bottom-0 z-50 w-72 bg-background border-l border-border"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-semibold">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-card transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:bg-card hover:text-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {profile && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                <Link
                  href="/perfil"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={profile.photo_url || undefined} />
                    <AvatarFallback className="bg-primary text-white">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">Ver perfil</p>
                  </div>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { isPremium } = useAuthStore();

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: FileText, label: 'Resumos', href: '/resumos' },
    { icon: Brain, label: 'Simulados', href: '/simulados' },
    { icon: Heart, label: 'Casos', href: '/casos' },
    { icon: User, label: 'Perfil', href: '/perfil' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-background/90 glass border-t border-border">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
