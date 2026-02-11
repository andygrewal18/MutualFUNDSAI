
-- Portfolio items table
CREATE TABLE public.portfolio_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('stock', 'fund')),
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    buy_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio" ON public.portfolio_items
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio" ON public.portfolio_items
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio" ON public.portfolio_items
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio" ON public.portfolio_items
FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_portfolio_items_updated_at
BEFORE UPDATE ON public.portfolio_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
