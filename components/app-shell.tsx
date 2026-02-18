"use client";

import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <main className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <MobileHeader />
        {children}
      </main>
    </div>
  );
}
