export type ModelProvider = "openrouter" | "huggingface";

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  modelId: string;
  description: string;
  maxTokens: number;
  capabilities: ModelCapability[];
  free: boolean;
}

export type ModelCapability =
  | "chat"
  | "code"
  | "vision"
  | "reasoning"
  | "research"
  | "crypto";

export const MODELS: ModelConfig[] = [
  {
    id: "qwen-2.5-72b",
    name: "Qwen 2.5 72B Instruct",
    provider: "openrouter",
    modelId: "qwen/qwen-2.5-72b-instruct:free",
    description: "Alibaba's flagship model. Excellent for reasoning, coding, and general tasks.",
    maxTokens: 4096,
    capabilities: ["chat", "code", "reasoning", "research"],
    free: true,
  },
  {
    id: "glm-4-32b",
    name: "GLM-4 32B",
    provider: "openrouter",
    modelId: "thudm/glm-z1-32b:free",
    description: "Tsinghua's GLM-4 model. Strong at structured reasoning and analysis.",
    maxTokens: 4096,
    capabilities: ["chat", "reasoning", "research", "crypto"],
    free: true,
  },
  {
    id: "qwen-2.5-coder",
    name: "Qwen 2.5 Coder 32B",
    provider: "openrouter",
    modelId: "qwen/qwen-2.5-coder-32b-instruct:free",
    description: "Specialized coding model. Best for code generation, auto-complete, and debugging.",
    maxTokens: 4096,
    capabilities: ["chat", "code"],
    free: true,
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1 0528",
    provider: "openrouter",
    modelId: "deepseek/deepseek-r1-0528:free",
    description: "DeepSeek's reasoning model. Excels at complex problem solving and math.",
    maxTokens: 8192,
    capabilities: ["chat", "code", "reasoning", "research", "crypto"],
    free: true,
  },
  {
    id: "qwen3-235b",
    name: "Qwen3 235B A22B",
    provider: "openrouter",
    modelId: "qwen/qwen3-235b-a22b:free",
    description: "Qwen3 MoE mega-model. Massive capacity for complex multi-step tasks.",
    maxTokens: 4096,
    capabilities: ["chat", "code", "reasoning", "research", "crypto"],
    free: true,
  },
];

export const DEFAULT_MODEL_ID = "qwen-2.5-72b";

export function getModel(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id);
}

export function getModelsByCapability(capability: ModelCapability): ModelConfig[] {
  return MODELS.filter((m) => m.capabilities.includes(capability));
}

export function getOpenRouterHeaders() {
  return {
    "HTTP-Referer": "https://si-agent.vercel.app",
    "X-Title": "SI Agent",
  };
}
