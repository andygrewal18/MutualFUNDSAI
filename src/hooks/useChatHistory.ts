import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Message = { role: "user" | "assistant"; content: string };

const WELCOME_MSG: Message = {
  role: "assistant",
  content: "Hi! I'm your AI Fund Advisor. Ask me anything about mutual funds — comparisons, risk analysis, investment scores, or recommendations. 📊",
};

export const useChatHistory = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setMessages([WELCOME_MSG]); setLoaded(true); return; }
    supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMessages([WELCOME_MSG, ...data.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))]);
        }
        setLoaded(true);
      });
  }, [user]);

  const saveMessage = useCallback(async (msg: Message) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({ user_id: user.id, role: msg.role, content: msg.content });
  }, [user]);

  const clearHistory = useCallback(async () => {
    if (!user) return;
    await supabase.from("chat_messages").delete().eq("user_id", user.id);
    setMessages([WELCOME_MSG]);
  }, [user]);

  return { messages, setMessages, saveMessage, clearHistory, loaded };
};
