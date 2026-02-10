import MarketTicker from "@/components/MarketTicker";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ScoreCards from "@/components/ScoreCards";
import FundComparisonTable from "@/components/FundComparisonTable";
import ChatBot from "@/components/ChatBot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MarketTicker />
      <HeroSection />
      <ScoreCards />
      <FundComparisonTable />
      <ChatBot />
    </div>
  );
};

export default Index;
