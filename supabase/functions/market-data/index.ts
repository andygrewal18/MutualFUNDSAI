import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYMBOLS = [
  { symbol: "^NSEI", name: "NIFTY 50" },
  { symbol: "^BSESN", name: "SENSEX" },
  { symbol: "NIFTY_MIDCAP_150.NS", name: "NIFTY MIDCAP" },
  { symbol: "^CNXSC", name: "NIFTY SMALLCAP" },
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
  const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
  return { value: parseFloat(price.toFixed(2)), change: parseFloat(change.toFixed(2)) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const results = await Promise.allSettled(
      SYMBOLS.map(async (s) => {
        const quote = await fetchQuote(s.symbol);
        return { name: s.name, ...(quote ?? { value: 0, change: 0 }) };
      })
    );

    const indices = results.map((r) =>
      r.status === "fulfilled" ? r.value : { name: "Unknown", value: 0, change: 0 }
    );

    return new Response(JSON.stringify({ indices, fetchedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching market data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch market data" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
