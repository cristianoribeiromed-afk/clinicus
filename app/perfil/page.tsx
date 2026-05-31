'use client';

import { motion } from 'framer-motion';
import { User, Mail, Calendar, Crown, Settings, LogOut, BarChart3, Trophy } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/lib/hooks/use-auth';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function PerfilPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { profile } = useAuth(true);
  const { isPremium } = useAuthStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!profile) return null;

  const planDetails = {
    free: { name: 'Plano Free', color: 'text-muted-foreground', badge: null },
    monthly: { name: 'Plano Mensal', color: 'text-primary', badge: 'Premium' },
    annual: { name: 'Plano Anual', color: 'text-secondary', badge: 'Premium' },
  };

  const currentPlan = planDetails[profile.plan as keyof typeof planDetails] || planDetails.free;

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 to-secondary/20" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage src={profile.photo_url || undefined} />
                <AvatarFallback className="bg-primary text-white text-3xl">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  {currentPlan.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      {currentPlan.badge}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${currentPlan.color}`}>{currentPlan.name}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="p-6 rounded-xl bg-card border border-border space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Informacoes da Conta
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {profile.plan_expires_at && (
                <div className="flex items-center gap-3">
                  <Crown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Assinatura ate {new Date(profile.plan_expires_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="p-6 rounded-xl bg-card border border-border space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-secondary" />
              Estatisticas
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">{profile.simulados_completed?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Simulados Completados</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profile.favorites?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Conteudos Favoritos</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profile.streak_days || 0}</p>
                <p className="text-xs text-muted-foreground">Dias Consecutivos</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{Object.keys(profile.progress || {}).length}</p>
                <p className="text-xs text-muted-foreground">Disciplinas Estudadas</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Upgrade CTA */}
        {!isPremium && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-primary/20">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold mb-1">Upgrade para Premium</h3>
                <p className="text-sm text-muted-foreground">
                  Desbloqueie todos os resumos, simulados ilimitados e casos clinicos
                </p>
              </div>
              <Link href="/planos">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Ver Planos
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-3">
          <h2 className="font-semibold mb-3">Configuracoes</h2>
          <div className="grid gap-2">
            <Button variant="ghost" className="justify-start gap-3 text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
              Preferencias de Notificacao
            </Button>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              Sair da Conta
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
