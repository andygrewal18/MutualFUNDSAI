import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STOCKS = [
  { id: "1", symbol: "RELIANCE.NS" },
  { id: "2", symbol: "HDFCBANK.NS" },
  { id: "3", symbol: "TCS.NS" },
  { id: "4", symbol: "ICICIBANK.NS" },
  { id: "5", symbol: "INFY.NS" },
  { id: "6", symbol: "BHARTIARTL.NS" },
  { id: "7", symbol: "ITC.NS" },
  { id: "8", symbol: "SBIN.NS" },
  { id: "9", symbol: "LT.NS" },
  { id: "10", symbol: "AXISBANK.NS" },
];

async function fetchQuote(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) return null;
  const price = meta.regularMarketPrice;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose;
  const change = prevClose ? price - prevClose : 0;
  const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
  return {
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const results = await Promise.allSettled(
      STOCKS.map(async (s) => {
        const quote = await fetchQuote(s.symbol);
        return { id: s.id, ...(quote ?? { price: 0, change: 0, changePercent: 0 }) };
      })
    );

    const stocks = results.map((r) =>
      r.status === "fulfilled" ? r.value : { id: "0", price: 0, change: 0, changePercent: 0 }
    );

    return new Response(JSON.stringify({ stocks, fetchedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching stock prices:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch stock prices" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
