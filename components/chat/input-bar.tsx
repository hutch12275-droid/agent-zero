"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { MODELS } from "@/lib/agent/models";
import { cn } from "@/lib/utils";
import { Send, Loader2, ChevronDown, Square } from "lucide-react";

interface InputBarProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  onStop?: () => void;
}

export function InputBar({ onSend, isLoading, onStop }: InputBarProps) {
  const [input, setInput] = useState("");
  const [showModels, setShowModels] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentModelId, setCurrentModelId } = useAppStore();

  const currentModel = MODELS.find((m) => m.id === currentModelId);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="border-t border-border bg-background px-4 py-3">
      {/* Model selector */}
      <div className="relative mb-2">
        <button
          onClick={() => setShowModels(!showModels)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-h-[32px]"
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              currentModel?.free ? "bg-terminal-green" : "bg-terminal-amber"
            )}
          />
          {currentModel?.name || "Select model"}
          <ChevronDown className="size-3" />
        </button>

        {showModels && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowModels(false)}
            />
            <div className="absolute bottom-full left-0 mb-1 z-20 w-72 rounded-md border border-border bg-card shadow-lg">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setCurrentModelId(model.id);
                    setShowModels(false);
                  }}
                  className={cn(
                    "flex flex-col w-full px-3 py-2.5 text-left hover:bg-muted transition-colors min-h-[44px]",
                    currentModelId === model.id && "bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-terminal-green" />
                    <span className="text-xs font-medium text-foreground">
                      {model.name}
                    </span>
                    <span className="ml-auto text-[10px] font-mono text-terminal-green">
                      FREE
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 pl-3.5">
                    {model.description}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask SI Agent anything..."
            rows={1}
            className="w-full resize-none rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 font-sans"
            style={{ fontSize: "16px" }}
            disabled={isLoading}
          />
        </div>

        {isLoading ? (
          <button
            onClick={onStop}
            className="flex size-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors shrink-0"
            aria-label="Stop generation"
          >
            <Square className="size-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className={cn(
              "flex size-11 items-center justify-center rounded-lg transition-colors shrink-0",
              input.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground"
            )}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
