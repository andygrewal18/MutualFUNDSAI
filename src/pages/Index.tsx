import MarketTicker from "@/components/MarketTicker";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ScoreCards from "@/components/ScoreCards";
import FundComparisonTable from "@/components/FundComparisonTable";
import ChatBot from "@/components/ChatBot";
import Nifty50Stocks from "@/components/Nifty50Stocks";
import PortfolioTracker from "@/components/PortfolioTracker";


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MarketTicker />
      <HeroSection />
      <ScoreCards />
      <PortfolioTracker />
      <Nifty50Stocks />
      <FundComparisonTable />
      <ChatBot />
    </div>
  );
};

export default Index;
