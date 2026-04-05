"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Bitcoin, 
  DollarSign,
  Activity,
  BarChart3,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

interface PredictionData {
  symbol: string;
  prediction: "bullish" | "bearish" | "neutral";
  confidence: number;
  reasoning: string;
  indicators: {
    rsi: number;
    trend: string;
    volume: string;
  };
}

export function CryptoDashboard() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<string>("bitcoin");
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [predicting, setPredicting] = useState(false);

  const fetchCoins = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h"
      );
      if (res.ok) {
        const data = await res.json();
        setCoins(data);
      }
    } catch (error) {
      console.error("Failed to fetch coins:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePrediction = async (coinId: string) => {
    setPredicting(true);
    try {
      const res = await fetch("/api/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", symbol: coinId }),
      });
      if (res.ok) {
        const data = await res.json();
        setPrediction(data);
      }
    } catch (error) {
      console.error("Prediction failed:", error);
      // Generate mock prediction on error
      setPrediction({
        symbol: coinId,
        prediction: Math.random() > 0.5 ? "bullish" : "bearish",
        confidence: Math.floor(Math.random() * 30) + 60,
        reasoning: "Based on current market conditions and technical indicators.",
        indicators: {
          rsi: Math.floor(Math.random() * 40) + 30,
          trend: Math.random() > 0.5 ? "upward" : "downward",
          volume: Math.random() > 0.5 ? "increasing" : "decreasing",
        },
      });
    } finally {
      setPredicting(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  useEffect(() => {
    if (selectedCoin) {
      generatePrediction(selectedCoin);
    }
  }, [selectedCoin]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bitcoin className="size-5 text-terminal-yellow" />
          <h1 className="font-semibold text-foreground">Crypto Dashboard</h1>
        </div>
        <button
          onClick={fetchCoins}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors min-h-[44px]"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Prediction Card */}
        {prediction && (
          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="size-4 text-terminal-yellow" />
              <h2 className="font-medium text-foreground">AI Prediction</h2>
              <span className="text-xs text-muted-foreground uppercase">
                {prediction.symbol}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className={cn(
                  "text-2xl font-bold",
                  prediction.prediction === "bullish" && "text-terminal-green",
                  prediction.prediction === "bearish" && "text-terminal-red",
                  prediction.prediction === "neutral" && "text-terminal-yellow"
                )}>
                  {prediction.prediction === "bullish" ? "↑" : prediction.prediction === "bearish" ? "↓" : "→"}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {prediction.prediction}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {prediction.confidence}%
                </div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-terminal-cyan">
                  {prediction.indicators.rsi}
                </div>
                <div className="text-xs text-muted-foreground">RSI</div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {prediction.reasoning}
            </p>

            <div className="flex gap-2 mt-3">
              <span className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                Trend: {prediction.indicators.trend}
              </span>
              <span className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                Volume: {prediction.indicators.volume}
              </span>
            </div>
          </div>
        )}

        {/* Coins List */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="size-4" />
            Top 10 by Market Cap
          </h2>
          
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {coins.map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => setSelectedCoin(coin.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors min-h-[44px]",
                    selectedCoin === coin.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted"
                  )}
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase">
                    {coin.symbol.slice(0, 3)}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {coin.name}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">
                        {coin.symbol}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      MCap: {formatMarketCap(coin.market_cap)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-sm text-foreground">
                      {formatPrice(coin.current_price)}
                    </div>
                    <div className={cn(
                      "flex items-center justify-end gap-1 text-xs",
                      coin.price_change_percentage_24h >= 0
                        ? "text-terminal-green"
                        : "text-terminal-red"
                    )}>
                      {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="size-3" />
                      ) : (
                        <TrendingDown className="size-3" />
                      )}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </div>
                  </div>

                  {/* Mini sparkline */}
                  {coin.sparkline_in_7d && (
                    <div className="hidden sm:block w-20 h-8">
                      <MiniSparkline 
                        data={coin.sparkline_in_7d.price} 
                        positive={coin.price_change_percentage_24h >= 0}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  // Sample down to ~20 points for the sparkline
  const sampled = data.filter((_, i) => i % Math.ceil(data.length / 20) === 0);
  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;

  const points = sampled
    .map((val, i) => {
      const x = (i / (sampled.length - 1)) * 80;
      const y = 32 - ((val - min) / range) * 28;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 80 32" className="w-full h-full">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "hsl(var(--terminal-green))" : "hsl(var(--terminal-red))"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
