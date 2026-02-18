import type { TechnicalIndicators } from "@/lib/agent/types";

export async function fetchCryptoData(symbol: string) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=true`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    // Fallback to search if direct ID fails
    const searchRes = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`
    );
    if (!searchRes.ok) throw new Error(`Failed to fetch data for ${symbol}`);
    const searchData = await searchRes.json();
    if (!searchData.coins?.[0]) throw new Error(`Coin "${symbol}" not found`);

    const coinId = searchData.coins[0].id;
    const retryRes = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=true`
    );
    if (!retryRes.ok) throw new Error(`Failed to fetch data for ${coinId}`);
    return retryRes.json();
  }

  return res.json();
}

export async function fetchMarketChart(symbol: string, days = 30) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}/market_chart?vs_currency=usd&days=${days}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) throw new Error(`Failed to fetch chart data for ${symbol}`);
  return res.json();
}

export async function fetchTopCoins(limit = 20) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`,
    { next: { revalidate: 120 } }
  );

  if (!res.ok) throw new Error("Failed to fetch top coins");
  return res.json();
}

// Technical Analysis Calculations
export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;

  const changes = prices.slice(1).map((p, i) => p - prices[i]);
  const recent = changes.slice(-period);

  let gains = 0;
  let losses = 0;
  for (const change of recent) {
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [prices[0]];

  for (let i = 1; i < prices.length; i++) {
    ema.push(prices[i] * k + ema[i - 1] * (1 - k));
  }

  return ema;
}

export function calculateMACD(prices: number[]) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = calculateEMA(macdLine, 9);

  const latest = macdLine.length - 1;
  return {
    macd: macdLine[latest],
    signal: signalLine[latest],
    histogram: macdLine[latest] - signalLine[latest],
  };
}

export function calculateBollingerBands(prices: number[], period = 20) {
  if (prices.length < period) {
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return { upper: avg * 1.02, middle: avg, lower: avg * 0.98 };
  }

  const recent = prices.slice(-period);
  const middle = recent.reduce((a, b) => a + b, 0) / period;
  const squaredDiffs = recent.map((p) => Math.pow(p - middle, 2));
  const stdDev = Math.sqrt(
    squaredDiffs.reduce((a, b) => a + b, 0) / period
  );

  return {
    upper: middle + 2 * stdDev,
    middle,
    lower: middle - 2 * stdDev,
  };
}

export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) {
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  }
  const recent = prices.slice(-period);
  return recent.reduce((a, b) => a + b, 0) / period;
}

export function calculateAllIndicators(
  prices: number[]
): TechnicalIndicators {
  const ema12Arr = calculateEMA(prices, 12);
  const ema26Arr = calculateEMA(prices, 26);

  return {
    rsi: calculateRSI(prices),
    macd: calculateMACD(prices),
    bollingerBands: calculateBollingerBands(prices),
    sma20: calculateSMA(prices, 20),
    sma50: calculateSMA(prices, 50),
    ema12: ema12Arr[ema12Arr.length - 1],
    ema26: ema26Arr[ema26Arr.length - 1],
  };
}

export function generateSignalSummary(indicators: TechnicalIndicators): string {
  const signals: string[] = [];

  // RSI
  if (indicators.rsi > 70) signals.push("RSI overbought (bearish signal)");
  else if (indicators.rsi < 30) signals.push("RSI oversold (bullish signal)");
  else signals.push("RSI neutral");

  // MACD
  if (indicators.macd.histogram > 0)
    signals.push("MACD bullish (above signal line)");
  else signals.push("MACD bearish (below signal line)");

  // Bollinger
  const bbPos =
    indicators.bollingerBands.upper - indicators.bollingerBands.lower;
  if (bbPos > 0) {
    signals.push(
      `Bollinger Band width: ${bbPos.toFixed(2)} (${bbPos > indicators.bollingerBands.middle * 0.04 ? "high volatility" : "low volatility"})`
    );
  }

  // Moving averages
  if (indicators.sma20 > indicators.sma50)
    signals.push("SMA20 above SMA50 (bullish trend)");
  else signals.push("SMA20 below SMA50 (bearish trend)");

  return signals.join("\n");
}
