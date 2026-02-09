import { BarChart3, Shield, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto text-center relative z-10">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary tracking-wide">Live Market Analysis</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-4">
            Compare Mutual Funds
            <br />
            <span className="gradient-text">With Intelligence</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            AI-powered fund analysis comparing returns, risk, and market conditions
            to give you a clear investment score.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {[
            { icon: BarChart3, title: "Smart Comparison", desc: "Side-by-side fund metrics" },
            { icon: Shield, title: "Risk Analysis", desc: "Market-adjusted scoring" },
            { icon: Zap, title: "AI Assistant", desc: "Ask anything about funds" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card-hover p-5 text-left">
              <Icon className="w-5 h-5 text-primary mb-3" />
              <p className="font-semibold text-sm text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
