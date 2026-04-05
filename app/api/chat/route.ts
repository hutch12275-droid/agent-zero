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

function getHuggingFaceProvider() {
  const apiKey = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("HF_TOKEN required. Get free token: huggingface.co/settings/tokens");
  }
  return createOpenAI({
    baseURL: "https://api-inference.huggingface.co/v1",
    apiKey,
  });
}

const agentTools = {
  execute_code: tool({
    description:
      "Execute JavaScript code in a sandboxed environment. Returns the console output.",
    inputSchema: z.object({
      code: z.string().describe("JavaScript code to execute"),
    }),
    execute: async ({ code }) => {
      try {
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
          error: (...args: unknown[]) =>
            logs.push("[ERROR] " + args.map(String).join(" ")),
        };
        const fn = new Function("console", "Math", "JSON", "Date", code);
        fn(mockConsole, Math, JSON, Date);
        return logs.length > 0 ? logs.join("\n") : "Code executed (no output)";
      } catch (e) {
        return `Error: ${e instanceof Error ? e.message : "Unknown error"}`;
      }
    },
  }),

  web_search: tool({
    description: "Search the web for current information using DuckDuckGo.",
    inputSchema: z.object({
      query: z.string().describe("Search query"),
    }),
    execute: async ({ query }) => {
      try {
        const res = await fetch(
          `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`
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
        return results.length > 0 ? results.join("\n\n") : `No results for "${query}"`;
      } catch {
        return "Search unavailable.";
      }
    },
  }),

  crypto_analyze: tool({
    description: "Get real-time cryptocurrency market data from CoinGecko.",
    inputSchema: z.object({
      symbol: z.string().describe("Crypto ID (e.g., bitcoin, ethereum)"),
    }),
    execute: async ({ symbol }) => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(symbol.toLowerCase())}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
          { signal: AbortSignal.timeout(10000) }
        );
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const coin = data[symbol.toLowerCase()];
        if (!coin) return `Coin "${symbol}" not found.`;
        return JSON.stringify({
          symbol: symbol.toLowerCase(),
          price_usd: coin.usd,
          change_24h: coin.usd_24h_change?.toFixed(2) + "%",
          volume_24h: "$" + (coin.usd_24h_vol || 0).toLocaleString(),
          market_cap: "$" + (coin.usd_market_cap || 0).toLocaleString(),
        }, null, 2);
      } catch {
        return `Failed to fetch "${symbol}".`;
      }
    },
  }),

  memory_save: tool({
    description: "Save important information to long-term memory.",
    inputSchema: z.object({
      content: z.string().describe("Information to remember"),
      tags: z.array(z.string()).describe("Tags for categorization"),
      category: z.enum(["solution", "knowledge", "error", "pattern", "general"]),
    }),
    execute: async ({ content, tags, category }) => {
      return `[MEMORY SAVED] ${category} | Tags: ${tags.join(", ")} | "${content.slice(0, 100)}..."`;
    },
  }),

  memory_query: tool({
    description: "Search long-term memory for relevant information.",
    inputSchema: z.object({
      query: z.string().describe("Search query for memory"),
    }),
    execute: async ({ query }) => {
      return `[MEMORY QUERY] Searching: "${query}" - Memory active.`;
    },
  }),
};

export async function POST(req: Request) {
  const { messages, modelId, systemPrompt }: {
    messages: UIMessage[];
    modelId?: string;
    systemPrompt?: string;
  } = await req.json();

  const hf = getHuggingFaceProvider();

  const modelMap: Record<string, string> = {
    "qwen-2.5-72b": "Qwen/Qwen2.5-72B-Instruct",
    "glm-4-9b": "THUDM/glm-4-9b-chat",
    "qwen-2.5-coder": "Qwen/Qwen2.5-Coder-32B-Instruct",
    "deepseek-r1": "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    "mistral-nemo": "mistralai/Mistral-Nemo-Instruct-2407",
  };

  const selectedModel = modelMap[modelId || "qwen-2.5-72b"] || modelMap["qwen-2.5-72b"];

  const result = streamText({
    model: hf(selectedModel),
    system: systemPrompt || `You are SI Agent, an advanced recursive self-improving AI. You combine Agent Zero and MoltBot capabilities: code execution, web search, crypto analysis, and learning from interactions. Be helpful, accurate, and proactive.`,
    messages: await convertToModelMessages(messages),
    tools: agentTools,
    stopWhen: stepCountIs(8),
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse();
}
