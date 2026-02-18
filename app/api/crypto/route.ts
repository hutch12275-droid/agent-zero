import { NextRequest, NextResponse } from "next/server";
import {
  calculateAllIndicators,
  generateSignalSummary,
} from "@/lib/tools/crypto-analysis";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") || "bitcoin";
  const includeIndicators =
    req.nextUrl.searchParams.get("indicators") !== "false";

  try {
    // Fetch price data
    const [priceRes, chartRes] = await Promise.all([
      fetch(
        `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(symbol.toLowerCase())}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=true`,
        { signal: AbortSignal.timeout(10000) }
      ),
      includeIndicators
        ? fetch(
            `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(symbol.toLowerCase())}/market_chart?vs_currency=usd&days=30`,
            { signal: AbortSignal.timeout(10000) }
          )
        : Promise.resolve(null),
    ]);

    if (!priceRes.ok) {
      return NextResponse.json(
        { error: `Coin "${symbol}" not found` },
        { status: 404 }
      );
    }

    const priceData = await priceRes.json();

    const result: Record<string, unknown> = {
      id: priceData.id,
      symbol: priceData.symbol,
      name: priceData.name,
      price: priceData.market_data?.current_price?.usd || 0,
      change24h: priceData.market_data?.price_change_percentage_24h || 0,
      change7d:
        priceData.market_data?.price_change_percentage_7d || 0,
      volume24h: priceData.market_data?.total_volume?.usd || 0,
      marketCap: priceData.market_data?.market_cap?.usd || 0,
      sparkline: priceData.market_data?.sparkline_7d?.price || [],
      image: priceData.image?.small,
      lastUpdated: priceData.last_updated,
    };

    if (includeIndicators && chartRes) {
      const chartData = await chartRes.json();
      const prices = (chartData.prices || []).map(
        (p: [number, number]) => p[1]
      );

      if (prices.length > 0) {
        const indicators = calculateAllIndicators(prices);
        result.indicators = indicators;
        result.signalSummary = generateSignalSummary(indicators);
        result.priceHistory = chartData.prices.map(
          (p: [number, number]) => ({
            time: p[0],
            price: p[1],
          })
        );
      }
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      {
        error: `Failed to fetch crypto data: ${e instanceof Error ? e.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Fetch top coins for the dashboard
  try {
    const body = await req.json();
    const limit = body.limit || 20;

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!res.ok) throw new Error("CoinGecko API error");
    const data = await res.json();

    return NextResponse.json({
      coins: data.map(
        (coin: {
          id: string;
          symbol: string;
          name: string;
          image: string;
          current_price: number;
          price_change_percentage_24h: number;
          total_volume: number;
          market_cap: number;
          sparkline_in_7d?: { price: number[] };
        }) => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h,
          volume24h: coin.total_volume,
          marketCap: coin.market_cap,
          sparkline: coin.sparkline_in_7d?.price || [],
        })
      ),
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: `Failed to fetch market data: ${e instanceof Error ? e.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
