import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { setFavorites(new Set()); return; }
    supabase
      .from("favorites")
      .select("fund_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setFavorites(new Set(data.map((f) => f.fund_id)));
      });
  }, [user]);

  const toggleFavorite = useCallback(async (fundId: string) => {
    if (!user) return;
    const isFav = favorites.has(fundId);
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("fund_id", fundId);
      setFavorites((prev) => { const s = new Set(prev); s.delete(fundId); return s; });
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, fund_id: fundId });
      setFavorites((prev) => new Set(prev).add(fundId));
    }
  }, [user, favorites]);

  return { favorites, toggleFavorite };
};
