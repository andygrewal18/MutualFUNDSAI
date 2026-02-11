import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Stock } from "@/data/stockData";
import { TrendingUp, TrendingDown, BarChart3, Building2, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StockDetailModalProps {
  stock: Stock | null;
  isOpen: boolean;
  onClose: () => void;
}

function generatePriceHistory(currentPrice: number, changePercent: number, days: number) {
  const data: { date: string; price: number }[] = [];
  const today = new Date();
  const volatility = Math.abs(changePercent) * 0.8 + 0.5;
  let price = currentPrice * (1 - (changePercent * days) / 36500);

  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const label =
      days <= 30
        ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        : d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

    price = price * (1 + (Math.random() - 0.45) * volatility * 0.01);
    data.push({ date: label, price: Math.round(price * 100) / 100 });
  }
  // ensure last data point matches current price
  data[data.length - 1].price = currentPrice;
  return data;
}

const PERIODS = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
];

const StockDetailModal = ({ stock, isOpen, onClose }: StockDetailModalProps) => {
  const [period, setPeriod] = useState("1M");
  const { user } = useAuth();
  const { addItem } = usePortfolio();
  const days = PERIODS.find((p) => p.label === period)?.days ?? 30;
  const chartData = useMemo(
    () => stock ? generatePriceHistory(stock.price, stock.changePercent, days) : [],
    [stock?.symbol, stock?.price, days]
  );

  if (!stock) return null;

  const isPositive = stock.changePercent >= 0;
  const chartColor = isPositive ? "hsl(160, 60%, 45%)" : "hsl(0, 72%, 51%)";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md border-primary/20">
        <DialogHeader className="text-left border-b border-border pb-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {stock.symbol}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                {stock.name} • {stock.sector}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-bold text-foreground">
                ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`flex items-center gap-1 text-sm font-mono font-bold ${
                  isPositive ? "text-chart-positive" : "text-chart-negative"
                }`}
              >
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? "+" : ""}
                {stock.changePercent}%
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Period selector */}
        <div className="flex gap-2 mb-2">
          {PERIODS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPeriod(p.label)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                period === p.label
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(215, 12%, 55%)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "hsl(215, 12%, 55%)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 12%)",
                  border: "1px solid hsl(220, 14%, 22%)",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(215, 12%, 55%)" }}
                formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#stockGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-secondary/10 border border-border/30 text-center">
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="w-3 h-3" /> Price
            </p>
            <p className="text-sm font-mono font-bold">
              ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/10 border border-border/30 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">Change</p>
            <p className={`text-sm font-mono font-bold ${isPositive ? "text-chart-positive" : "text-chart-negative"}`}>
              {isPositive ? "+" : ""}₹{stock.change.toFixed(2)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-secondary/10 border border-border/30 text-center">
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mb-1">
              <Building2 className="w-3 h-3" /> Sector
            </p>
            <p className="text-sm font-semibold">{stock.sector}</p>
          </div>
        </div>
        {user && (
          <button
            onClick={async () => {
              await addItem({ item_type: "stock", item_id: stock.id, item_name: stock.name, quantity: 1, buy_price: stock.price });
              toast.success(`${stock.symbol} added to portfolio`);
            }}
            className="mt-4 w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Briefcase className="w-4 h-4" /> Add to Portfolio
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StockDetailModal;
