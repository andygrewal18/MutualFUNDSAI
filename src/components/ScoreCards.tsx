import { fundsData, getScoreColor, getScoreLabel } from "@/data/fundData";
import InvestmentScoreRing from "./InvestmentScoreRing";
import { TrendingUp, Percent, Shield } from "lucide-react";

const ScoreCards = () => {
  const topFunds = [...fundsData].sort((a, b) => b.investmentScore - a.investmentScore).slice(0, 4);

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-2">Top Investment Picks</h2>
        <p className="text-sm text-muted-foreground mb-6">Highest scoring funds based on market-adjusted analysis</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topFunds.map((fund, i) => (
            <div
              key={fund.id}
              className="glass-card-hover p-5 animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">{fund.category}</p>
                  <h3 className="font-semibold text-sm text-foreground mt-1 truncate">{fund.name}</h3>
                </div>
                <InvestmentScoreRing score={fund.investmentScore} size={52} />
              </div>

              <div className={`text-xs font-semibold mb-4 ${getScoreColor(fund.investmentScore)}`}>
                {getScoreLabel(fund.investmentScore)} Investment
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" /> 5Y Return
                  </span>
                  <span className="text-xs font-mono font-semibold text-chart-positive">
                    +{fund.returns5Y}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Percent className="w-3 h-3" /> Expense
                  </span>
                  <span className="text-xs font-mono font-semibold text-foreground">
                    {fund.expenseRatio}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" /> Risk
                  </span>
                  <span className={`text-xs font-semibold ${fund.riskLevel === "Moderate" ? "text-chart-warning" : fund.riskLevel === "High" ? "text-score-poor" : "text-score-bad"}`}>
                    {fund.riskLevel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScoreCards;
