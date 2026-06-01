
ALTER TABLE public.finance_recurring_bills
  ADD COLUMN IF NOT EXISTS frequency text NOT NULL DEFAULT 'monthly';

ALTER TABLE public.financial_transactions
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.finance_goals
  ADD COLUMN IF NOT EXISTS category text;
