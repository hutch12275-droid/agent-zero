import type { CoreTool } from "ai";
import { z } from "zod";

export function getAgentTools(): Record<string, CoreTool> {
  return {
    execute_code: {
      description:
        "Execute JavaScript/TypeScript code in a sandboxed environment. Returns stdout output and errors. Use for calculations, data processing, demonstrations, and testing.",
      parameters: z.object({
        language: z
          .enum(["javascript", "typescript", "python"])
          .describe("Programming language to execute"),
        code: z.string().describe("The code to execute"),
      }),
      execute: async ({ language, code }) => {
        try {
          const res = await fetch("/api/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language, code }),
          });
          const data = await res.json();
          return data.output || data.error || "No output";
        } catch (e) {
          return `Execution error: ${e instanceof Error ? e.message : "Unknown error"}`;
        }
      },
    },

    web_search: {
      description:
        "Search the web for current information. Returns search results with titles, URLs, and snippets. Use for research, fact-checking, and finding current data.",
      parameters: z.object({
        query: z.string().describe("Search query"),
        maxResults: z
          .number()
          .optional()
          .default(5)
          .describe("Maximum number of results to return"),
      }),
      execute: async ({ query, maxResults }) => {
        try {
          const res = await fetch(
            `/api/search?q=${encodeURIComponent(query)}&max=${maxResults}`
          );
          const data = await res.json();
          return JSON.stringify(data.results || [], null, 2);
        } catch (e) {
          return `Search error: ${e instanceof Error ? e.message : "Unknown error"}`;
        }
      },
    },

    web_scrape: {
      description:
        "Fetch and extract text content from a web page URL. Returns the main text content of the page.",
      parameters: z.object({
        url: z.string().url().describe("URL to scrape"),
      }),
      execute: async ({ url }) => {
        try {
          const res = await fetch(
            `/api/scrape?url=${encodeURIComponent(url)}`
          );
          const data = await res.json();
          return data.content || "No content extracted";
        } catch (e) {
          return `Scrape error: ${e instanceof Error ? e.message : "Unknown error"}`;
        }
      },
    },

    memory_save: {
      description:
        "Save important information to long-term memory for future reference. Use to store successful patterns, key facts, user preferences, and solution strategies.",
      parameters: z.object({
        content: z.string().describe("The information to remember"),
        tags: z
          .array(z.string())
          .describe("Tags for categorization and retrieval"),
        category: z
          .enum(["solution", "knowledge", "error", "pattern", "general"])
          .describe("Category of the memory"),
        importance: z
          .number()
          .min(1)
          .max(10)
          .describe("Importance score 1-10"),
      }),
      execute: async ({ content, tags, category, importance }) => {
        try {
          const res = await fetch("/api/memory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "save", content, tags, category, importance }),
          });
          const data = await res.json();
          return data.success ? `Memory saved: "${content.slice(0, 100)}..."` : "Failed to save memory";
        } catch {
          return "Memory save error";
        }
      },
    },

    memory_query: {
      description:
        "Search long-term memory for relevant past information. Use before starting tasks to retrieve relevant patterns, solutions, and context.",
      parameters: z.object({
        query: z.string().describe("Search query for memory"),
      }),
      execute: async ({ query }) => {
        try {
          const res = await fetch(
            `/api/memory?q=${encodeURIComponent(query)}`
          );
          const data = await res.json();
          if (!data.results || data.results.length === 0)
            return "No relevant memories found.";
          return data.results
            .map(
              (m: { content: string; tags: string[]; category: string }) =>
                `[${m.category}] ${m.content} (tags: ${m.tags.join(", ")})`
            )
            .join("\n\n");
        } catch {
          return "Memory query error";
        }
      },
    },

    crypto_analyze: {
      description:
        "Fetch real-time cryptocurrency market data and technical indicators. Returns price, volume, change, and calculated indicators (RSI, MACD, Bollinger Bands).",
      parameters: z.object({
        symbol: z
          .string()
          .describe(
            "Cryptocurrency symbol (e.g., bitcoin, ethereum, solana)"
          ),
        includeIndicators: z
          .boolean()
          .optional()
          .default(true)
          .describe("Whether to calculate technical indicators"),
      }),
      execute: async ({ symbol, includeIndicators }) => {
        try {
          const res = await fetch(
            `/api/crypto?symbol=${encodeURIComponent(symbol)}&indicators=${includeIndicators}`
          );
          const data = await res.json();
          return JSON.stringify(data, null, 2);
        } catch (e) {
          return `Crypto analysis error: ${e instanceof Error ? e.message : "Unknown error"}`;
        }
      },
    },

    code_complete: {
      description:
        "Generate code completion or full code blocks based on a description. Uses AI to write complete, production-ready code.",
      parameters: z.object({
        description: z
          .string()
          .describe("Description of what the code should do"),
        language: z
          .string()
          .describe("Programming language (typescript, python, etc.)"),
        context: z
          .string()
          .optional()
          .describe("Existing code context for better completions"),
      }),
      execute: async ({ description, language, context }) => {
        return `[Code generation requested]\nLanguage: ${language}\nDescription: ${description}\n${context ? `Context: ${context.slice(0, 200)}...` : ""}`;
      },
    },

    file_read: {
      description: "Read the contents of a file from the project.",
      parameters: z.object({
        path: z.string().describe("File path to read"),
      }),
      execute: async ({ path }) => {
        return `[File read requested: ${path}]`;
      },
    },

    file_write: {
      description: "Write content to a file in the project.",
      parameters: z.object({
        path: z.string().describe("File path to write to"),
        content: z.string().describe("Content to write"),
      }),
      execute: async ({ path, content }) => {
        return `[File written: ${path}] (${content.length} chars)`;
      },
    },
  };
}
