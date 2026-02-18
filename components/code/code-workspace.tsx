"use client";

import { useState, useCallback } from "react";
import { Play, Trash2, Download, Loader2, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLE_CODE = `// SI Agent - Code Execution Sandbox
// Write JavaScript code and run it instantly

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence (first 10):");
for (let i = 0; i < 10; i++) {
  console.log(\`  fib(\${i}) = \${fibonacci(i)}\`);
}

console.log("\\nSum of first 100 natural numbers:");
const sum = Array.from({length: 100}, (_, i) => i + 1).reduce((a, b) => a + b, 0);
console.log(\`  \${sum}\`);
`;

export function CodeWorkspace() {
  const [code, setCode] = useState(EXAMPLE_CODE);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState<"javascript" | "typescript" | "python">("javascript");

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput("Running...\n");

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();
      setOutput(data.output || data.error || "No output");
    } catch (e) {
      setOutput(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setIsRunning(false);
    }
  }, [code, language]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-terminal-cyan" />
          <h1 className="text-sm font-semibold text-foreground font-sans">
            Code Sandbox
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
            className="rounded-md border border-border bg-muted px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[36px]"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
          </select>

          <button
            onClick={() => {
              setCode("");
              setOutput("");
            }}
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Clear code"
          >
            <Trash2 className="size-4" />
          </button>

          <button
            onClick={runCode}
            disabled={isRunning || !code.trim()}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px]",
              isRunning
                ? "bg-terminal-amber/10 text-terminal-amber"
                : "bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20"
            )}
          >
            {isRunning ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            {isRunning ? "Running" : "Run"}
          </button>
        </div>
      </div>

      {/* Editor + Output */}
      <div className="flex flex-1 flex-col lg:flex-row min-h-0">
        {/* Code editor */}
        <div className="flex-1 flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-border">
          <div className="px-4 py-1.5 text-xs font-mono text-muted-foreground bg-muted/30 border-b border-border">
            editor.{language === "python" ? "py" : language === "typescript" ? "ts" : "js"}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 resize-none bg-background p-4 font-mono text-sm text-foreground focus:outline-none leading-6"
            style={{ fontSize: "16px", tabSize: 2 }}
            spellCheck={false}
            placeholder="Write your code here..."
          />
        </div>

        {/* Terminal output */}
        <div className="flex-1 flex flex-col min-h-0 lg:max-w-[50%]">
          <div className="px-4 py-1.5 text-xs font-mono text-muted-foreground bg-muted/30 border-b border-border flex items-center gap-2">
            <span className="size-2 rounded-full bg-terminal-green" />
            output
          </div>
          <div className="flex-1 overflow-y-auto bg-background p-4">
            {output ? (
              <pre className="font-mono text-sm text-terminal-green whitespace-pre-wrap leading-6">
                {output}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground font-mono">
                {"// Output will appear here after running code"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
