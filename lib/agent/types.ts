export type AgentMode = "chat" | "developer" | "researcher" | "hacker" | "crypto";

export interface AgentProfile {
  id: AgentMode;
  name: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  defaultModel: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  agentMode?: AgentMode;
  modelId?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  name: string;
  result: string;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  agentMode: AgentMode;
  modelId: string;
  createdAt: number;
  updatedAt: number;
}

export interface MemoryEntry {
  id: string;
  content: string;
  tags: string[];
  category: "solution" | "knowledge" | "error" | "pattern" | "general";
  importance: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  sparkline?: number[];
  lastUpdated: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  bollingerBands: { upper: number; middle: number; lower: number };
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
}

export interface CryptoPrediction {
  symbol: string;
  direction: "bullish" | "bearish" | "neutral";
  confidence: number;
  reasoning: string;
  indicators: TechnicalIndicators;
  priceTarget: { low: number; mid: number; high: number };
  timeframe: string;
  timestamp: number;
}

export interface SILearningEntry {
  id: string;
  taskType: string;
  approach: string;
  outcome: "success" | "failure" | "partial";
  toolChain: string[];
  insight: string;
  timestamp: number;
}
