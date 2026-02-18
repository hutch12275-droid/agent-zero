"use client";

import { useAppStore } from "@/lib/store";
import { AGENT_PROFILES } from "@/lib/agent/prompts";
import { Menu, Plus } from "lucide-react";

export function MobileHeader() {
  const { agentMode, toggleSidebar, createConversation } = useAppStore();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background lg:hidden">
      <button
        onClick={toggleSidebar}
        className="flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted"
        aria-label="Open sidebar"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded bg-primary/10 text-primary font-mono font-bold text-xs">
          SI
        </div>
        <span className="text-sm font-medium text-foreground font-sans">
          {AGENT_PROFILES[agentMode].name}
        </span>
      </div>

      <button
        onClick={() => createConversation()}
        className="flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted"
        aria-label="New chat"
      >
        <Plus className="size-5" />
      </button>
    </header>
  );
}
