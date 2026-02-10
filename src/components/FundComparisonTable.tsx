import { useState } from "react";
import { fundsData, Fund, getRiskColor, getScoreLabel, getScoreColor } from "@/data/fundData";
import InvestmentScoreRing from "./InvestmentScoreRing";
import { Star, ArrowUpDown, ArrowUp, ArrowDown, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";

type SortKey = keyof Fund;
type SortDir = "asc" | "desc";

const FundComparisonTable = () => {
  const [sortKey, setSortKey] = useState<SortKey>("investmentScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();

  const categories = ["All", ...new Set(fundsData.map((f) => f.category))];

  const filtered = selectedCategory === "All" ? fundsData : fundsData.filter((f) => f.category === selectedCategory);

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    return sortDir === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  const columns = [
    ...(user ? [{ key: "" as SortKey, label: "♡" }] : []),
    { key: "name" as SortKey, label: "Fund Name" },
    { key: "investmentScore" as SortKey, label: "Score" },
    { key: "returns1Y" as SortKey, label: "1Y Return" },
    { key: "returns3Y" as SortKey, label: "3Y Return" },
    { key: "returns5Y" as SortKey, label: "5Y Return" },
    { key: "riskLevel" as SortKey, label: "Risk" },
    { key: "expenseRatio" as SortKey, label: "Expense %" },
    { key: "rating" as SortKey, label: "Rating" },
    { key: "aum" as SortKey, label: "AUM (Cr)" },
  ];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold">Fund Comparison</h2>
            <p className="text-sm text-muted-foreground mt-1">Compare top mutual funds across key metrics</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {columns.map(({ key, label }) => (
                    <th
                      key={key || "fav"}
                      className={`text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${
                        key ? "cursor-pointer hover:text-foreground" : ""
                      } transition-colors select-none`}
                      onClick={() => key && toggleSort(key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {label} {key && <SortIcon columnKey={key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((fund, i) => (
                  <tr
                    key={fund.id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {user && (
                      <td className="px-4 py-4">
                        <button onClick={() => toggleFavorite(fund.id)} className="hover:scale-110 transition-transform">
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              favorites.has(fund.id)
                                ? "text-destructive fill-destructive"
                                : "text-muted-foreground hover:text-destructive"
                            }`}
                          />
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-foreground">{fund.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{fund.category} • {fund.amc}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <InvestmentScoreRing score={fund.investmentScore} size={44} />
                        <span className={`text-xs font-medium ${getScoreColor(fund.investmentScore)}`}>
                          {getScoreLabel(fund.investmentScore)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-mono font-semibold ${fund.returns1Y >= 0 ? "text-chart-positive" : "text-chart-negative"}`}>
                        {fund.returns1Y >= 0 ? "+" : ""}{fund.returns1Y}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-mono font-semibold ${fund.returns3Y >= 0 ? "text-chart-positive" : "text-chart-negative"}`}>
                        {fund.returns3Y >= 0 ? "+" : ""}{fund.returns3Y}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-mono font-semibold ${fund.returns5Y >= 0 ? "text-chart-positive" : "text-chart-negative"}`}>
                        {fund.returns5Y >= 0 ? "+" : ""}{fund.returns5Y}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-semibold ${getRiskColor(fund.riskLevel)}`}>
                        {fund.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-foreground">{fund.expenseRatio}%</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className={`w-3.5 h-3.5 ${
                              j < fund.rating ? "text-chart-warning fill-chart-warning" : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-foreground">₹{(fund.aum).toLocaleString("en-IN")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FundComparisonTable;
