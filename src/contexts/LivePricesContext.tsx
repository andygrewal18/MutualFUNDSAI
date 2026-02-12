import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type StockPrice = { price: number; change: number; changePercent: number };
type LivePrices = {
  stockPrices: Record<string, StockPrice>; // keyed by stock id
  fundNavs: Record<string, number>;        // keyed by fund id
  stocksLoading: boolean;
  fundsLoading: boolean;
  lastStockUpdate: string | null;
  lastFundUpdate: string | null;
};

const LivePricesContext = createContext<LivePrices>({
  stockPrices: {},
  fundNavs: {},
  stocksLoading: false,
  fundsLoading: false,
  lastStockUpdate: null,
  lastFundUpdate: null,
});

export const useLivePrices = () => useContext(LivePricesContext);

export const LivePricesProvider = ({ children }: { children: ReactNode }) => {
  const [stockPrices, setStockPrices] = useState<Record<string, StockPrice>>({});
  const [fundNavs, setFundNavs] = useState<Record<string, number>>({});
  const [stocksLoading, setStocksLoading] = useState(false);
  const [fundsLoading, setFundsLoading] = useState(false);
  const [lastStockUpdate, setLastStockUpdate] = useState<string | null>(null);
  const [lastFundUpdate, setLastFundUpdate] = useState<string | null>(null);

  const fetchStockPrices = useCallback(async () => {
    setStocksLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stock-prices");
      if (!error && data?.stocks) {
        const prices: Record<string, StockPrice> = {};
        for (const s of data.stocks) {
          if (s.price > 0) {
            prices[s.id] = { price: s.price, change: s.change, changePercent: s.changePercent };
          }
        }
        if (Object.keys(prices).length > 0) {
          setStockPrices(prices);
          setLastStockUpdate(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
        }
      }
    } catch {
      // keep existing data
    } finally {
      setStocksLoading(false);
    }
  }, []);

  const fetchFundNavs = useCallback(async () => {
    setFundsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fund-navs");
      if (!error && data?.funds) {
        const navs: Record<string, number> = {};
        for (const [id, nav] of Object.entries(data.funds)) {
          if (typeof nav === "number" && nav > 0) {
            navs[id] = nav;
          }
        }
        if (Object.keys(navs).length > 0) {
          setFundNavs(navs);
          setLastFundUpdate(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
        }
      }
    } catch {
      // keep existing data
    } finally {
      setFundsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockPrices();
    fetchFundNavs();

    // Stock prices: every 60 seconds
    const stockInterval = setInterval(fetchStockPrices, 60_000);

    // Fund NAVs: once a day (refresh every 24 hours, but also on mount)
    const fundInterval = setInterval(fetchFundNavs, 24 * 60 * 60 * 1000);

    return () => {
      clearInterval(stockInterval);
      clearInterval(fundInterval);
    };
  }, [fetchStockPrices, fetchFundNavs]);

  return (
    <LivePricesContext.Provider value={{ stockPrices, fundNavs, stocksLoading, fundsLoading, lastStockUpdate, lastFundUpdate }}>
      {children}
    </LivePricesContext.Provider>
  );
};
