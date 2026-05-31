"use client";

import { ReactNode } from "react";
import { Sidebar, MobileSidebar, BottomNav } from "./sidebar";
import { DashboardHeader } from "./header";

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  return (
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
    </div>
  );
}

export function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
    </div>
  );
}
