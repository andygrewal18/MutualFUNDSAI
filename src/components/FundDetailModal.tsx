import React, { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Fund, getRiskColor, getScoreColor, getScoreLabel } from "@/data/fundData";
import InvestmentScoreRing from "./InvestmentScoreRing";
import SIPCalculator from "./SIPCalculator";
import { TrendingUp, Shield, BarChart3, Info, Wallet, PieChart, Briefcase } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import { toast } from "sonner";

function generateFundHistory(returns1Y: number, returns3Y: number, returns5Y: number) {
    const data: { year: string; value: number }[] = [];
    let nav = 100;
    const annualReturns = [
        returns5Y * 0.8, returns5Y * 1.1, returns5Y * 0.9,
        returns3Y * 0.95, returns3Y * 1.05,
        returns1Y,
    ];
    const startYear = new Date().getFullYear() - 5;
    data.push({ year: `${startYear}`, value: Math.round(nav * 100) / 100 });
    for (let i = 0; i < 6; i++) {
        nav = nav * (1 + annualReturns[i] / 100);
        data.push({ year: `${startYear + i + 1}`, value: Math.round(nav * 100) / 100 });
    }
    return data;
}

interface FundDetailModalProps {
    fund: Fund | null;
    isOpen: boolean;
    onClose: () => void;
}

const FundDetailModal = ({ fund, isOpen, onClose }: FundDetailModalProps) => {
    const { user } = useAuth();
    const { addItem } = usePortfolio();
    const chartData = useMemo(
        () => fund ? generateFundHistory(fund.returns1Y, fund.returns3Y, fund.returns5Y) : [],
        [fund?.id]
    );
    if (!fund) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md border-primary/20">
                <DialogHeader className="text-left border-b border-border pb-4 mb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <DialogTitle className="text-2xl font-bold text-foreground">{fund.name}</DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-1">
                                {fund.category} • {fund.amc}
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-3 bg-secondary/20 p-2 rounded-xl border border-border/50">
                            <InvestmentScoreRing score={fund.investmentScore} size={50} />
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">AI Score</p>
                                <p className={`text-sm font-bold ${getScoreColor(fund.investmentScore)}`}>
                                    {getScoreLabel(fund.investmentScore)} ({fund.investmentScore})
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Fund Details */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-secondary/10 border border-border/30">
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <BarChart3 className="w-3 h-3" /> NAV
                                </p>
                                <p className="text-xl font-mono font-bold">₹{fund.nav.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-secondary/10 border border-border/30">
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Risk Level
                                </p>
                                <p className={`text-lg font-bold ${getRiskColor(fund.riskLevel)}`}>{fund.riskLevel}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" /> Performance History
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 bg-secondary/5 rounded-lg border border-border/50 text-center">
                                    <p className="text-[10px] text-muted-foreground">1Y Return</p>
                                    <p className="text-sm font-mono font-bold text-chart-positive">+{fund.returns1Y}%</p>
                                </div>
                                <div className="p-3 bg-secondary/5 rounded-lg border border-border/50 text-center">
                                    <p className="text-[10px] text-muted-foreground">3Y Return</p>
                                    <p className="text-sm font-mono font-bold text-chart-positive">+{fund.returns3Y}%</p>
                                </div>
                                <div className="p-3 bg-secondary/5 rounded-lg border border-border/50 text-center">
                                    <p className="text-[10px] text-muted-foreground">5Y Return</p>
                                    <p className="text-sm font-mono font-bold text-chart-positive">+{fund.returns5Y}%</p>
                                </div>
                            </div>
                            {/* Growth chart */}
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(215, 12%, 55%)" }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 55%)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 14%, 22%)", borderRadius: "0.5rem", fontSize: "12px" }}
                                            labelStyle={{ color: "hsl(215, 12%, 55%)" }}
                                            formatter={(value: number) => [`₹${value.toFixed(2)}`, "₹100 invested"]}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="hsl(160, 60%, 45%)" strokeWidth={2} fill="url(#fundGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-[10px] text-muted-foreground text-center">Growth of ₹100 invested 5 years ago (simulated)</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary" /> Fund Information
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between py-2 border-b border-border/30">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Wallet className="w-3 h-3" /> Min Investment
                                    </span>
                                    <span className="text-sm font-semibold">₹{fund.minInvestment.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/30">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <PieChart className="w-3 h-3" /> AUM
                                    </span>
                                    <span className="text-sm font-semibold">₹{fund.aum.toLocaleString("en-IN")} Cr</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/30">
                                    <span className="text-sm text-muted-foreground">Expense Ratio</span>
                                    <span className="text-sm font-semibold">{fund.expenseRatio}%</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/30">
                                    <span className="text-sm text-muted-foreground">Benchmark</span>
                                    <span className="text-sm font-semibold">{fund.benchmark}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-sm text-muted-foreground">Exit Load</span>
                                    <span className="text-sm font-semibold text-right max-w-[200px]">{fund.exitLoad}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: SIP Calculator */}
                    <div className="lg:border-l lg:border-border lg:pl-8">
                        <SIPCalculator defaultReturn={fund.returns3Y} />
                        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <p className="text-xs text-primary/80 leading-relaxed italic">
                                * Returns are based on historical data. Future returns are not guaranteed. Mutal fund investments are subject to market risks.
                            </p>
                        </div>
                    </div>
                </div>
                {user && (
                    <button
                        onClick={async () => {
                            await addItem({ item_type: "fund", item_id: fund.id, item_name: fund.name, quantity: 1, buy_price: fund.nav });
                            toast.success(`${fund.name} added to portfolio`);
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

export default FundDetailModal;
