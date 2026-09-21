"use client";

import { ReactNode } from "react";
import { Sidebar, MobileSidebar, BottomNav } from "./sidebar";
import { DashboardHeader } from "./header";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { UniversidadeGate } from "@/components/ui/universidade-gate";

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  const conteudo = (
    <div className="min-h-screen bg-background">
      {showSidebar && (
        <>
          <Sidebar />
          <MobileSidebar />
        </>
      )}

      <main className={showSidebar ? "lg:pl-64" : ""}>
        {showSidebar && <DashboardHeader />}
        <div className={`${showSidebar ? "pb-20 lg:pb-0 pt-16 lg:pt-0" : ""}`}>
          {children}
        </div>
      </main>

      {showSidebar && <BottomNav />}

      {/* Botão WhatsApp flutuante */}
      <WhatsAppButton />
    </div>
  );

  // O portão só se aplica às páginas com sidebar (o app autenticado de
  // verdade) -- não a páginas avulsas como checkout, que usam
  // showSidebar={false} e não precisam saber de universidade nenhuma.
  return showSidebar ? <UniversidadeGate>{conteudo}</UniversidadeGate> : conteudo;
}

export function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
      {/* Botão WhatsApp flutuante na landing */}
      <WhatsAppButton />
    </div>
  );
}
