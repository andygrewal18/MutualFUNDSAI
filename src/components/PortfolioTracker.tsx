import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio, PortfolioItem } from "@/hooks/usePortfolio";
import { nifty50Stocks } from "@/data/stockData";
import { fundsData } from "@/data/fundData";
import { Trash2, Plus, TrendingUp, TrendingDown, Briefcase, PieChart, IndianRupee, ChevronDown } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
} from "recharts";

const COLORS = [
  "hsl(160, 60%, 45%)", "hsl(210, 80%, 55%)", "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 55%)", "hsl(0, 72%, 51%)", "hsl(80, 60%, 45%)",
  "hsl(330, 60%, 50%)", "hsl(190, 70%, 45%)",
];

function getCurrentPrice(item: PortfolioItem): number {
  if (item.item_type === "stock") {
    const stock = nifty50Stocks.find((s) => s.id === item.item_id);
    return stock?.price ?? item.buy_price;
  }
  const fund = fundsData.find((f) => f.id === item.item_id);
  return fund?.nav ?? item.buy_price;
}

const PortfolioTracker = () => {
  const { user } = useAuth();
  const { items, loading, addItem, removeItem } = usePortfolio();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addType, setAddType] = useState<"stock" | "fund">("stock");
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [buyPrice, setBuyPrice] = useState("");

  if (!user) {
    return (
      <section className="py-12 px-4" id="portfolio">
        <div className="container mx-auto text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Portfolio Tracker</h2>
          <p className="text-muted-foreground">Sign in to track your investments and view portfolio performance.</p>
        </div>
      </section>
    );
  }

  const totalInvested = items.reduce((sum, i) => sum + i.buy_price * i.quantity, 0);
  const totalCurrent = items.reduce((sum, i) => sum + getCurrentPrice(i) * i.quantity, 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const pieData = items.map((i) => ({
    name: i.item_name.length > 15 ? i.item_name.slice(0, 15) + "…" : i.item_name,
    value: getCurrentPrice(i) * i.quantity,
  }));

  const availableStocks = nifty50Stocks.filter((s) => !items.some((i) => i.item_id === s.id && i.item_type === "stock"));
  const availableFunds = fundsData.filter((f) => !items.some((i) => i.item_id === f.id && i.item_type === "fund"));
  const options = addType === "stock" ? availableStocks : availableFunds;

  const handleAdd = async () => {
    if (!selectedId || !buyPrice) return;
    const option = addType === "stock"
      ? nifty50Stocks.find((s) => s.id === selectedId)
      : fundsData.find((f) => f.id === selectedId);
    if (!option) return;
    await addItem({
      item_type: addType,
      item_id: selectedId,
      item_name: "name" in option ? option.name : "",
      quantity: parseFloat(quantity) || 1,
      buy_price: parseFloat(buyPrice),
    });
    setShowAddForm(false);
    setSelectedId("");
    setQuantity("1");
    setBuyPrice("");
  };

  const handleSelectChange = (id: string) => {
    setSelectedId(id);
    if (addType === "stock") {
      const s = nifty50Stocks.find((x) => x.id === id);
      if (s) setBuyPrice(s.price.toString());
    } else {
      const f = fundsData.find((x) => x.id === id);
      if (f) setBuyPrice(f.nav.toString());
    }
  };

  return (
    <section className="py-12 px-4 bg-secondary/10" id="portfolio">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" /> Portfolio Tracker
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Track your investments in one place</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Investment
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="glass-card p-6 mb-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <div className="flex gap-2">
                  {(["stock", "fund"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setAddType(t); setSelectedId(""); setBuyPrice(""); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${addType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                    >
                      {t === "stock" ? "Stock" : "Fund"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Select {addType}</label>
                <div className="relative">
                  <select
                    value={selectedId}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground appearance-none pr-8"
                  >
                    <option value="">Choose...</option>
                    {options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {"symbol" in o ? o.symbol : o.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Quantity</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Buy Price (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!selectedId || !buyPrice}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-5">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <IndianRupee className="w-3 h-3" /> Invested
              </p>
              <p className="text-xl font-mono font-bold">₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <PieChart className="w-3 h-3" /> Current Value
              </p>
              <p className="text-xl font-mono font-bold">₹{totalCurrent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                {totalPnL >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} P&L
              </p>
              <p className={`text-xl font-mono font-bold ${totalPnL >= 0 ? "text-chart-positive" : "text-chart-negative"}`}>
                {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                <span className="text-sm ml-1">({totalPnLPercent >= 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}%)</span>
              </p>
            </div>
          </div>
        )}

        {/* Pie Chart + Holdings Table */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Allocation Pie */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Allocation</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 14%, 22%)", borderRadius: "0.5rem", fontSize: "12px" }}
                      formatter={(value: number) => [`₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, "Value"]}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {pieData.map((d, i) => (
                  <span key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Holdings Table */}
            <div className="glass-card overflow-hidden lg:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Buy ₹</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Current ₹</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">P&L</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => {
                      const current = getCurrentPrice(item);
                      const pnl = (current - item.buy_price) * item.quantity;
                      const pnlPct = ((current - item.buy_price) / item.buy_price) * 100;
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors animate-fade-in"
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-foreground">{item.item_name}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.item_type === "stock" ? "bg-chart-info/20 text-chart-info" : "bg-primary/20 text-primary"}`}>
                              {item.item_type === "stock" ? "Stock" : "Fund"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-mono">₹{item.buy_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3 text-right font-mono">₹{current.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-mono font-bold ${pnl >= 0 ? "text-chart-positive" : "text-chart-negative"}`}>
                              {pnl >= 0 ? "+" : ""}₹{pnl.toFixed(0)}
                              <span className="text-[10px] ml-1">({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No investments added yet. Click "Add Investment" to get started.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PortfolioTracker;
