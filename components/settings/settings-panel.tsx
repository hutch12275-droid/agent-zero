"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { MODELS, ModelConfig } from "@/lib/agent/models";
import { AGENT_PROFILES } from "@/lib/agent/prompts";
import { 
  Settings, 
  Cpu, 
  Bot, 
  Palette, 
  Bell, 
  Shield,
  Check,
  ChevronRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsPanel() {
  const { 
    currentModelId, 
    setModel, 
    agentMode, 
    setAgentMode,
  } = useAppStore();
  const [activeSection, setActiveSection] = useState<string>("model");

  const sections = [
    { id: "model", label: "AI Model", icon: <Cpu className="size-4" /> },
    { id: "agent", label: "Agent Mode", icon: <Bot className="size-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="size-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="size-4" /> },
    { id: "privacy", label: "Privacy", icon: <Shield className="size-4" /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Settings className="size-5 text-primary" />
        <h1 className="font-semibold text-foreground">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Section Tabs (Mobile) */}
        <div className="flex overflow-x-auto gap-2 px-4 py-3 border-b border-border md:hidden">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors min-h-[44px]",
                activeSection === s.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-6">
          {/* Model Selection */}
          <section className={cn(activeSection !== "model" && "hidden md:block")}>
            <h2 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Cpu className="size-4 text-terminal-cyan" />
              AI Model
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Choose which HuggingFace model powers your SI Agent. All models are free to use.
            </p>
            <div className="space-y-2">
              {MODELS.map((model) => (
                <ModelOption
                  key={model.id}
                  model={model}
                  selected={currentModelId === model.id}
                  onSelect={() => setModel(model.id)}
                />
              ))}
            </div>
          </section>

          {/* Agent Mode */}
          <section className={cn(activeSection !== "agent" && "hidden md:block")}>
            <h2 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Bot className="size-4 text-terminal-green" />
              Agent Mode
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Switch between specialized agent personalities for different tasks.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(AGENT_PROFILES).map(([key, profile]) => (
                <button
                  key={key}
                  onClick={() => setAgentMode(key)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border text-left transition-colors min-h-[44px]",
                    agentMode === key
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md",
                    agentMode === key ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Zap className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">
                      {profile.name}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {profile.description}
                    </div>
                  </div>
                  {agentMode === key && (
                    <Check className="size-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Appearance */}
          <section className={cn(activeSection !== "appearance" && "hidden md:block")}>
            <h2 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Palette className="size-4 text-terminal-yellow" />
              Appearance
            </h2>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-foreground">Dark Mode</div>
                  <div className="text-xs text-muted-foreground">
                    Terminal-inspired dark theme is always enabled
                  </div>
                </div>
                <div className="flex size-10 items-center justify-center rounded-md bg-terminal-green/20 text-terminal-green">
                  <Check className="size-5" />
                </div>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className={cn(activeSection !== "notifications" && "hidden md:block")}>
            <h2 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Bell className="size-4 text-terminal-red" />
              Notifications
            </h2>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">
                Notification settings coming soon. Stay tuned for browser notifications and alerts.
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section className={cn(activeSection !== "privacy" && "hidden md:block")}>
            <h2 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              Privacy
            </h2>
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Check className="size-4 text-terminal-green mt-0.5" />
                <div>
                  <div className="font-medium text-sm text-foreground">Local Storage Only</div>
                  <div className="text-xs text-muted-foreground">
                    Your memories and settings are stored locally in your browser
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="size-4 text-terminal-green mt-0.5" />
                <div>
                  <div className="font-medium text-sm text-foreground">No Tracking</div>
                  <div className="text-xs text-muted-foreground">
                    We do not track your conversations or usage patterns
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="size-4 text-terminal-green mt-0.5" />
                <div>
                  <div className="font-medium text-sm text-foreground">Open Source</div>
                  <div className="text-xs text-muted-foreground">
                    Fully transparent codebase - audit it yourself
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ModelOption({
  model,
  selected,
  onSelect,
}: {
  model: ModelConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left min-h-[44px]",
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:bg-muted"
      )}
    >
      <div className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg",
        selected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      )}>
        <Cpu className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">{model.name}</span>
          {model.isFree && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-terminal-green/20 text-terminal-green">
              FREE
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {model.provider} - {model.contextLength.toLocaleString()} tokens
        </div>
        <div className="text-xs text-muted-foreground line-clamp-1">
          {model.description}
        </div>
      </div>
      {selected && (
        <Check className="size-5 text-primary shrink-0" />
      )}
    </button>
  );
}
