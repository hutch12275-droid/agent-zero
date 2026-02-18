"use client";

import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Bot,
  User,
  Wrench,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useCallback } from "react";

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return "";
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = getUIMessageText(message);
  const toolParts = message.parts?.filter((p) => p.type === "tool-invocation") || [];

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md mt-0.5",
          isUser
            ? "bg-primary/15 text-primary"
            : "bg-terminal-green/15 text-terminal-green"
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col gap-2 min-w-0 max-w-[85%] lg:max-w-[75%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Text */}
        {text && (
          <div
            className={cn(
              "rounded-lg px-4 py-3 text-sm leading-relaxed",
              isUser
                ? "bg-primary/10 text-foreground"
                : "bg-card text-foreground border border-border"
            )}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{text}</p>
            ) : (
              <MarkdownContent content={text} />
            )}
          </div>
        )}

        {/* Tool Invocations */}
        {toolParts.map((part, i) => {
          if (part.type !== "tool-invocation") return null;
          return (
            <ToolInvocationDisplay
              key={`${part.toolInvocation.toolCallId}-${i}`}
              toolInvocation={part.toolInvocation}
              state={part.state}
            />
          );
        })}
      </div>
    </div>
  );
}

function ToolInvocationDisplay({
  toolInvocation,
  state,
}: {
  toolInvocation: { toolCallId: string; toolName: string; args: Record<string, unknown>; output?: unknown };
  state: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLoading = state === "input-available" || state === "input-streaming";
  const hasOutput = state === "output-available";

  return (
    <div className="w-full rounded-md border border-border bg-muted/50 overflow-hidden text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-muted/80 min-h-[44px]"
      >
        <Wrench className="size-3.5 text-terminal-amber shrink-0" />
        <span className="font-mono text-terminal-amber font-medium">
          {toolInvocation.toolName}
        </span>
        {isLoading && (
          <span className="text-muted-foreground ml-auto flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-terminal-amber animate-pulse-glow" />
            running...
          </span>
        )}
        {hasOutput && (
          <span className="text-terminal-green ml-auto">done</span>
        )}
        {expanded ? (
          <ChevronDown className="size-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-border px-3 py-2 space-y-2">
          {toolInvocation.args && (
            <div>
              <p className="text-muted-foreground mb-1">Input:</p>
              <pre className="bg-card rounded p-2 overflow-x-auto text-foreground font-mono">
                {JSON.stringify(toolInvocation.args, null, 2)}
              </pre>
            </div>
          )}
          {hasOutput && toolInvocation.output !== undefined && (
            <div>
              <p className="text-muted-foreground mb-1">Output:</p>
              <pre className="bg-card rounded p-2 overflow-x-auto text-terminal-green font-mono whitespace-pre-wrap">
                {typeof toolInvocation.output === "string"
                  ? toolInvocation.output
                  : JSON.stringify(toolInvocation.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-terminal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeText = String(children).replace(/\n$/, "");

            if (match) {
              return (
                <CodeBlock language={match[1]} code={codeText} />
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="relative group my-2 rounded-md overflow-hidden border border-border">
      <div className="flex items-center justify-between bg-muted px-3 py-1.5">
        <span className="text-xs font-mono text-muted-foreground">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[32px] min-w-[32px] justify-center"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="size-3.5 text-terminal-green" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.8rem",
          background: "hsl(240 12% 7%)",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
