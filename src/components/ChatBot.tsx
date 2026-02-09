import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const defaultResponses: Record<string, string> = {
  default:
    "I can help you compare mutual funds, understand risk levels, and analyze investment scores. Try asking about a specific fund or category!",
  "large cap":
    "Large Cap funds invest in top companies by market capitalization. They offer stability with moderate returns. Axis Bluechip (Score: 88) and Mirae Asset Large Cap (Score: 85) are top picks in our analysis.",
  "mid cap":
    "Mid Cap funds target growing companies with higher return potential. Kotak Emerging Equity (Score: 86) and HDFC Mid-Cap Opportunities (Score: 82) stand out with strong 5Y returns above 20%.",
  "small cap":
    "Small Cap funds carry higher risk but can deliver exceptional returns. SBI Small Cap Fund leads with +24.6% 5Y returns, though its score (79) reflects the elevated risk.",
  risk: "Risk assessment considers volatility, market conditions, and fund category. Large caps are 'Moderate', mid caps 'High', and small caps 'Very High'. Lower risk doesn't always mean better—it depends on your investment horizon.",
  score:
    "Our Investment Score (0-100) weighs returns (40%), risk-adjusted performance (25%), expense ratio (15%), fund management quality (10%), and AUM stability (10%). Parag Parikh Flexi Cap leads at 91.",
  best: "Based on current market analysis, Parag Parikh Flexi Cap (91), Axis Bluechip (88), and Kotak Emerging Equity (86) are our top 3 picks across categories.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(defaultResponses)) {
    if (key !== "default" && lower.includes(key)) return response;
  }
  if (lower.includes("expense")) return "Lower expense ratios mean more of your returns stay with you. Look for funds under 0.7%. Axis Bluechip (0.49%) and Kotak Emerging Equity (0.51%) are the most cost-efficient.";
  if (lower.includes("sip") || lower.includes("invest")) return "Most funds here accept SIP starting at ₹500. For beginners, I'd recommend starting with a Large Cap or Flexi Cap fund for a balanced approach.";
  return defaultResponses.default;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your Fund Analysis Assistant. Ask me about mutual funds, risk, returns, or investment scores. 📊" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(userMsg.content);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl glow-primary transition-transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[500px] glass-card flex flex-col overflow-hidden animate-fade-up shadow-2xl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Fund Advisor AI</p>
              <p className="text-xs text-muted-foreground">Ask anything about mutual funds</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-primary" />
                </div>
                <div className="bg-secondary px-3 py-2 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about funds, risk, scores..."
                className="flex-1 bg-secondary text-sm text-foreground placeholder:text-muted-foreground px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
