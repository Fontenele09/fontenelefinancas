
-- Accounts
CREATE TABLE public.finance_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  initial_balance NUMERIC NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#4f46e5',
  credit_limit NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accounts_all_own" ON public.finance_accounts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ft_user ON public.financial_transactions(user_id, date DESC);
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_all_own" ON public.financial_transactions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Budgets
CREATE TABLE public.finance_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  "limit" NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);
ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "budgets_all_own" ON public.finance_budgets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Goals
CREATE TABLE public.finance_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  target NUMERIC NOT NULL,
  saved NUMERIC NOT NULL DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.finance_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_all_own" ON public.finance_goals FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Recurring bills
CREATE TABLE public.finance_recurring_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_day INTEGER NOT NULL,
  category TEXT,
  paid_month TEXT,
  auto_pay BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.finance_recurring_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bills_all_own" ON public.finance_recurring_bills FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.finance_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.finance_budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.finance_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.finance_recurring_bills;
