import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PortfolioItem = {
  id: string;
  item_type: "stock" | "fund";
  item_id: string;
  item_name: string;
  quantity: number;
  buy_price: number;
  created_at: string;
};

export function usePortfolio() {
  const { user } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data as PortfolioItem[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = async (item: Omit<PortfolioItem, "id" | "created_at">) => {
    if (!user) return;
    await supabase.from("portfolio_items").insert({ ...item, user_id: user.id });
    fetchItems();
  };

  const removeItem = async (id: string) => {
    await supabase.from("portfolio_items").delete().eq("id", id);
    fetchItems();
  };

  const updateItem = async (id: string, quantity: number, buy_price: number) => {
    await supabase.from("portfolio_items").update({ quantity, buy_price }).eq("id", id);
    fetchItems();
  };

  return { items, loading, addItem, removeItem, updateItem, fetchItems };
}
