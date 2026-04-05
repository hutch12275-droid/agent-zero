"use client";

import { AppShell } from "@/components/app-shell";
import { MemoryBrowser } from "@/components/memory/memory-browser";

export default function MemoryPage() {
  return (
    <AppShell>
      <MemoryBrowser />
    </AppShell>
  );
}
