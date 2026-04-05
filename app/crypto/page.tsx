"use client";

import { AppShell } from "@/components/app-shell";
import { CryptoDashboard } from "@/components/crypto/crypto-dashboard";

export default function CryptoPage() {
  return (
    <AppShell>
      <CryptoDashboard />
    </AppShell>
  );
}
