import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// AMFI scheme codes mapped to our fund IDs
const FUNDS = [
  { id: "1", code: "120503" },   // Axis Bluechip Fund
  { id: "2", code: "118834" },   // Mirae Asset Large Cap
  { id: "3", code: "125497" },   // SBI Small Cap
  { id: "4", code: "118989" },   // HDFC Mid-Cap Opportunities
  { id: "5", code: "122639" },   // Parag Parikh Flexi Cap
  { id: "6", code: "120242" },   // ICICI Pru Balanced Advantage
  { id: "7", code: "120505" },   // Kotak Emerging Equity
  { id: "8", code: "118668" },   // Nippon India Growth
  { id: "9", code: "148748" },   // Nippon India Multi Cap
  { id: "10", code: "120823" },  // Quant Active
  { id: "11", code: "147611" },  // Mahindra Manulife Multi Cap
  { id: "12", code: "149870" },  // HDFC Multi Cap
  { id: "13", code: "119212" },  // HDFC Balanced Advantage
  { id: "14", code: "118550" },  // HDFC Flexi Cap
];

async function fetchNav(code: string) {
  const url = `https://api.mfapi.in/mf/${code}/latest`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const latest = data?.data?.[0];
  if (!latest) return null;
  return parseFloat(latest.nav);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const results = await Promise.allSettled(
      FUNDS.map(async (f) => {
        const nav = await fetchNav(f.code);
        return { id: f.id, nav };
      })
    );

    const funds: Record<string, number> = {};
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.nav !== null) {
        funds[r.value.id] = r.value.nav;
      }
    }

    return new Response(JSON.stringify({ funds, fetchedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching fund NAVs:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch fund NAVs" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
