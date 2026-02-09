import { marketOverview } from "@/data/fundData";
import { TrendingUp, TrendingDown } from "lucide-react";

const indices = [
  { name: "NIFTY 50", ...marketOverview.nifty50 },
  { name: "SENSEX", ...marketOverview.sensex },
  { name: "NIFTY MIDCAP", ...marketOverview.niftyMidcap },
  { name: "NIFTY SMALLCAP", ...marketOverview.niftySmallcap },
];

const MarketTicker = () => {
  return (
    <div className="w-full border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto flex items-center gap-8 overflow-x-auto py-3 px-4 scrollbar-hide">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest whitespace-nowrap">
          Market
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
