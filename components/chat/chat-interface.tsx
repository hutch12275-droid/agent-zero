"use client";

import { useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useAppStore } from "@/lib/store";
import { AGENT_PROFILES } from "@/lib/agent/prompts";
import { MessageBubble } from "./message-bubble";
import { InputBar } from "./input-bar";
import { Bot, Zap, Code2, Search, TrendingUp, Brain } from "lucide-react";

export function ChatInterface() {
  const { agentMode, currentModelId } = useAppStore();
  const profile = AGENT_PROFILES[agentMode];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: {
            messages,
            id,
            modelId: currentModelId,
            systemPrompt: profile.systemPrompt,
          },
        }),
      }),
    [currentModelId, profile.systemPrompt]
  );

  const { messages, sendMessage, status, stop } = useChat({
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    sendMessage({ text });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState agentMode={agentMode} onSuggestionClick={handleSend} />
        ) : (
          <div className="flex flex-col gap-4 px-4 py-4 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-terminal-green/15 text-terminal-green mt-0.5">
                  <Bot className="size-4" />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-3">
                  <span className="size-1.5 rounded-full bg-terminal-cyan animate-pulse-glow" />
                  <span className="size-1.5 rounded-full bg-terminal-cyan animate-pulse-glow delay-100" />
                  <span className="size-1.5 rounded-full bg-terminal-cyan animate-pulse-glow delay-200" />
                  <span className="text-xs text-muted-foreground ml-2 font-mono">
                    thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <InputBar onSend={handleSend} isLoading={isLoading} onStop={stop} />
    </div>
  );
}

function EmptyState({ 
  agentMode, 
  onSuggestionClick 
}: { 
  agentMode: string; 
  onSuggestionClick: (text: string) => void;
}) {
  const suggestions: Record<string, string[]> = {
    chat: [
      "Explain quantum computing in simple terms",
      "Help me write a Python script to sort files",
      "What are the latest trends in AI?",
      "Analyze the pros and cons of microservices",
    ],
    developer: [
      "Build a REST API with Express and TypeScript",
      "Create a React component for a data table",
      "Help me debug this async/await issue",
      "Design a database schema for a blog",
    ],
    researcher: [
      "Research the current state of fusion energy",
      "Compare different ML frameworks for production",
      "Find recent papers on transformer architectures",
      "Summarize the latest in CRISPR gene editing",
    ],
    hacker: [
      "Explain common OWASP vulnerabilities",
      "How to set up a secure development environment",
      "Analyze security headers for a web app",
      "Best practices for API key management",
    ],
    crypto: [
      "Analyze Bitcoin's current technical indicators",
      "Compare Ethereum vs Solana fundamentals",
      "What does the RSI say about BTC right now?",
      "Give me a market overview of top 10 cryptos",
    ],
  };

  const modeIcons: Record<string, React.ReactNode> = {
    chat: <Zap className="size-6" />,
    developer: <Code2 className="size-6" />,
    researcher: <Search className="size-6" />,
    hacker: <Brain className="size-6" />,
    crypto: <TrendingUp className="size-6" />,
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
        {modeIcons[agentMode] || <Bot className="size-6" />}
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1 text-balance text-center font-sans">
        {AGENT_PROFILES[agentMode as keyof typeof AGENT_PROFILES]?.name || "SI Agent"}
      </h2>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-md text-pretty">
        {AGENT_PROFILES[agentMode as keyof typeof AGENT_PROFILES]?.description ||
          "Your all-in-one AI assistant"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {(suggestions[agentMode] || suggestions.chat).map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(s)}
            className="rounded-lg border border-border bg-card px-4 py-3 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors min-h-[44px]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
