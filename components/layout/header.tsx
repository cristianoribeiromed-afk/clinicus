"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Stethoscope, LogOut, User, Crown, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_CONFIG } from "@/lib/config";

export function Header() {
  const pathname = usePathname();
  const { profile, isPremium } = useAuthStore();
  const isLanding = pathname === "/";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isLanding
          ? "bg-transparent border-transparent"
          : "bg-background/80 glass border-b border-border",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block">
              {APP_CONFIG.name}
            </span>
          </Link>

          {/* Nav Links - Landing Only */}
          {isLanding && (
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="#funcionalidades"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Funcionalidades
              </Link>
              <Link
                href="#disciplinas"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Disciplinas
              </Link>
              <Link
                href="#planos"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Planos
              </Link>
              <Link
                href="#faq"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </Link>
            </nav>
          )}

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            {profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-card transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile.photo_url || undefined} />
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {(profile.name || profile.email || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm hidden sm:block">
                      {(profile.name || profile.email || "Usuário").split(" ")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{profile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {profile.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isPremium ? (
                    <DropdownMenuLabel className="flex items-center gap-2 text-secondary">
                      <Crown className="w-4 h-4" />
                      Plano Premium
                    </DropdownMenuLabel>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/planos" className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Upgrade Premium
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/login"
                      className="flex items-center gap-2 text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/login?register=true"
                  className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition-all"
                >
                  Comecar Gratis
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Dashboard Header (shown inside dashboard layout)
export function DashboardHeader() {
  const { profile, isPremium } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-background/80 glass border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        <div>
          <p className="text-xs text-muted-foreground">{getGreeting()}</p>
          <p className="font-semibold">{(profile?.name || profile?.email || "Usuário").split(" ")[0]}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isPremium && (
            <Link
              href="/planos"
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary/20 text-primary rounded-lg"
            >
              <Crown className="w-3 h-3" />
              Premium
            </Link>
          )}
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.photo_url || undefined} />
            <AvatarFallback className="bg-primary text-white text-xs">
              {(profile?.name || profile?.email || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
