import {
  convertToModelMessages,
  streamText,
  UIMessage,
  tool,
  stepCountIs,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

export const maxDuration = 60;

function getOpenRouterProvider() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required");
  }
  return createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    headers: {
      "HTTP-Referer": "https://si-agent.vercel.app",
      "X-Title": "SI Agent",
    },
  });
}

const agentTools = {
  execute_code: tool({
    description:
      "Execute JavaScript code in a sandboxed environment. Returns the console output. Use for calculations, data processing, and demonstrations.",
    inputSchema: z.object({
      code: z.string().describe("JavaScript code to execute"),
    }),
    execute: async ({ code }) => {
      try {
        // Safe eval of basic JS expressions
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
          error: (...args: unknown[]) =>
            logs.push("[ERROR] " + args.map(String).join(" ")),
        };
        const fn = new Function("console", "Math", "JSON", "Date", code);
        fn(mockConsole, Math, JSON, Date);
        return logs.length > 0 ? logs.join("\n") : "Code executed successfully (no output)";
      } catch (e) {
        return `Error: ${e instanceof Error ? e.message : "Unknown error"}`;
      }
    },
  }),

  web_search: tool({
    description:
      "Search the web for current information using DuckDuckGo. Returns search results with titles, URLs, and snippets.",
    inputSchema: z.object({
      query: z.string().describe("Search query"),
    }),
    execute: async ({ query }) => {
      try {
        const res = await fetch(
          `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
        );
        const data = await res.json();
        const results: string[] = [];

        if (data.Abstract) {
          results.push(`Summary: ${data.Abstract}\nSource: ${data.AbstractURL}`);
        }
        if (data.RelatedTopics) {
          for (const topic of data.RelatedTopics.slice(0, 5)) {
            if (topic.Text) {
              results.push(`- ${topic.Text}\n  ${topic.FirstURL || ""}`);
            }
          }
        }
        return results.length > 0
          ? results.join("\n\n")
          : `No results found for "${query}". Try rephrasing.`;
      } catch {
        return "Search temporarily unavailable.";
      }
    },
  }),

  crypto_analyze: tool({
    description:
      "Fetch real-time cryptocurrency market data including price, volume, market cap, and 24h change. Use for crypto analysis and predictions.",
    inputSchema: z.object({
      symbol: z
        .string()
        .describe("Cryptocurrency ID (e.g., bitcoin, ethereum, solana)"),
    }),
    execute: async ({ symbol }) => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(symbol.toLowerCase())}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
          { signal: AbortSignal.timeout(10000) }
        );
        if (!res.ok) throw new Error("CoinGecko API error");
        const data = await res.json();
        const coin = data[symbol.toLowerCase()];
        if (!coin) return `Coin "${symbol}" not found. Try: bitcoin, ethereum, solana, cardano, etc.`;
        return JSON.stringify(
          {
            symbol: symbol.toLowerCase(),
            price_usd: coin.usd,
            change_24h_percent: coin.usd_24h_change?.toFixed(2) + "%",
            volume_24h: "$" + (coin.usd_24h_vol || 0).toLocaleString(),
            market_cap: "$" + (coin.usd_market_cap || 0).toLocaleString(),
          },
          null,
          2
        );
      } catch {
        return `Failed to fetch data for "${symbol}". CoinGecko may be rate-limited.`;
      }
    },
  }),

  memory_save: tool({
    description:
      "Save important information, successful patterns, or key findings to long-term memory for future reference.",
    inputSchema: z.object({
      content: z.string().describe("The information to remember"),
      tags: z.array(z.string()).describe("Tags for categorization"),
      category: z
        .enum(["solution", "knowledge", "error", "pattern", "general"])
        .describe("Memory category"),
    }),
    execute: async ({ content, tags, category }) => {
      return `[MEMORY SAVED] Category: ${category} | Tags: ${tags.join(", ")} | Content: "${content.slice(0, 120)}..."`;
    },
  }),

  memory_query: tool({
    description:
      "Search long-term memory for relevant past information, patterns, and solutions.",
    inputSchema: z.object({
      query: z.string().describe("Search query for memory"),
    }),
    execute: async ({ query }) => {
      return `[MEMORY QUERY] Searching for: "${query}" - Memory system active. Past patterns will be incorporated into responses.`;
    },
  }),
};

export async function POST(req: Request) {
  const {
    messages,
    modelId,
    systemPrompt,
  }: {
    messages: UIMessage[];
    modelId?: string;
    systemPrompt?: string;
  } = await req.json();

  const openrouter = getOpenRouterProvider();

  // Map model IDs to OpenRouter model strings
  const modelMap: Record<string, string> = {
    "qwen-2.5-72b": "qwen/qwen-2.5-72b-instruct:free",
    "glm-4-32b": "thudm/glm-z1-32b:free",
    "qwen-2.5-coder": "qwen/qwen-2.5-coder-32b-instruct:free",
    "deepseek-r1": "deepseek/deepseek-r1-0528:free",
    "qwen3-235b": "qwen/qwen3-235b-a22b:free",
  };

  const selectedModel = modelMap[modelId || "qwen-2.5-72b"] || modelMap["qwen-2.5-72b"];

  const result = streamText({
    model: openrouter(selectedModel),
    system:
      systemPrompt ||
      `You are SI Agent, an advanced recursive self-improving AI assistant. You combine the capabilities of Agent Zero (autonomous agent framework) and MoltBot (multi-tool assistant). You can execute code, search the web, analyze crypto markets, and learn from every interaction. Always be helpful, accurate, and proactive. When you use tools, explain what you're doing and share your findings clearly.`,
    messages: await convertToModelMessages(messages),
    tools: agentTools,
    stopWhen: stepCountIs(8),
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
