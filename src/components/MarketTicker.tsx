import { useEffect, useState } from "react";
import { marketOverview } from "@/data/fundData";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type IndexData = { name: string; value: number; change: number };

const fallbackIndices: IndexData[] = [
  { name: "NIFTY 50", ...marketOverview.nifty50 },
  { name: "SENSEX", ...marketOverview.sensex },
  { name: "NIFTY MIDCAP", ...marketOverview.niftyMidcap },
  { name: "NIFTY SMALLCAP", ...marketOverview.niftySmallcap },
];

const MarketTicker = () => {
  const [indices, setIndices] = useState<IndexData[]>(fallbackIndices);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("market-data");
      if (!error && data?.indices?.length) {
        const valid = data.indices.filter((i: IndexData) => i.value > 0);
        if (valid.length > 0) {
          setIndices(valid);
          setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
        }
      }
    } catch {
      // keep fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto flex items-center gap-8 overflow-x-auto py-3 px-4 scrollbar-hide">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5">
          Market
          {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
          {lastUpdated && !loading && (
            <span className="text-[10px] font-normal normal-case tracking-normal opacity-60">{lastUpdated}</span>
          )}
        </span>
        {indices.map((idx) => (
          <div key={idx.name} className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-medium text-foreground/80">{idx.name}</span>
            <span className="text-sm font-mono font-semibold text-foreground">
              {idx.value.toLocaleString("en-IN")}
            </span>
            <span
              className={`flex items-center gap-0.5 text-xs font-mono font-semibold ${
                idx.change >= 0 ? "text-chart-positive" : "text-chart-negative"
              }`}
            >
              {idx.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {idx.change >= 0 ? "+" : ""}
              {idx.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
