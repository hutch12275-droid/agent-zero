"use client";

import { useAppStore } from "@/lib/store";
import { AGENT_PROFILES } from "@/lib/agent/prompts";
import type { AgentMode } from "@/lib/agent/types";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Code2,
  Search,
  Shield,
  TrendingUp,
  Plus,
  Trash2,
  X,
  Brain,
  Settings,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MODE_ICONS: Record<AgentMode, React.ReactNode> = {
  chat: <MessageSquare className="size-4" />,
  developer: <Code2 className="size-4" />,
  researcher: <Search className="size-4" />,
  hacker: <Shield className="size-4" />,
  crypto: <TrendingUp className="size-4" />,
};

const NAV_ITEMS = [
  { href: "/", label: "Chat", icon: <MessageSquare className="size-4" /> },
  { href: "/code", label: "Code", icon: <Code2 className="size-4" /> },
  { href: "/crypto", label: "Crypto", icon: <TrendingUp className="size-4" /> },
  { href: "/memory", label: "Memory", icon: <Brain className="size-4" /> },
  { href: "/settings", label: "Settings", icon: <Settings className="size-4" /> },
];

export function Sidebar() {
  const {
    sidebarOpen,
    toggleSidebar,
    agentMode,
    setAgentMode,
    conversations,
    currentConversationId,
    createConversation,
    setCurrentConversation,
    deleteConversation,
  } = useAppStore();

  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary font-mono font-bold text-sm">
              SI
            </div>
            <span className="font-sans font-semibold text-foreground text-sm">
              SI Agent
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="flex size-8 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-3 border-b border-sidebar-border">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors min-h-[44px]",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Agent Mode Selector */}
        <div className="px-3 py-3 border-b border-sidebar-border">
          <p className="px-3 pb-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Agent Mode
          </p>
          <div className="flex flex-col gap-0.5">
            {(Object.keys(AGENT_PROFILES) as AgentMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setAgentMode(mode)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-left min-h-[44px]",
                  agentMode === mode
                    ? "bg-terminal-cyan/10 text-terminal-cyan"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                {MODE_ICONS[mode]}
                <div className="flex flex-col">
                  <span className="text-xs font-medium">
                    {AGENT_PROFILES[mode].name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex items-center justify-between px-3 pb-2">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Chats
            </p>
            <button
              onClick={() => createConversation()}
              className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              aria-label="New chat"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            {conversations.length === 0 && (
              <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                No conversations yet. Start a new chat.
              </p>
            )}
            {conversations.map((convo) => (
              <div
                key={convo.id}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors min-h-[44px]",
                  currentConversationId === convo.id
                    ? "bg-sidebar-accent text-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
                onClick={() => setCurrentConversation(convo.id)}
              >
                <MessageSquare className="size-3.5 shrink-0" />
                <span className="truncate flex-1 text-xs">{convo.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(convo.id);
                  }}
                  className="hidden group-hover:flex size-5 items-center justify-center rounded text-muted-foreground hover:text-destructive"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground font-mono">
            SI Agent v1.0 / Agent Zero + MoltBot
          </p>
        </div>
      </aside>
    </>
  );
}
