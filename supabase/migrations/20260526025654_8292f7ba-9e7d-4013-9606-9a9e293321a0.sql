GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.finance_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.financial_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.finance_budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.finance_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.finance_recurring_bills TO authenticated;