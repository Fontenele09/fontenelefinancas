import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { FinanceState, Account, Transaction, Budget, Goal, RecurringBill } from "@/lib/finance-types";

const empty: FinanceState = {
  accounts: [], transactions: [], budgets: [], goals: [], recurringBills: [],
};

const mapAccount = (r: any): Account => ({
  id: r.id, name: r.name, type: r.type,
  initialBalance: Number(r.initial_balance), color: r.color,
  creditLimit: r.credit_limit != null ? Number(r.credit_limit) : undefined,
});
const mapTx = (r: any): Transaction => ({
  id: r.id, accountId: r.account_id, type: r.type, amount: Number(r.amount),
  category: r.category, description: r.description ?? "", date: r.date,
});
const mapBudget = (r: any): Budget => ({ id: r.id, category: r.category, limit: Number(r.limit) });
const mapGoal = (r: any): Goal => ({
  id: r.id, name: r.name, target: Number(r.target), saved: Number(r.saved),
  deadline: r.deadline ?? undefined,
});
const mapBill = (r: any): RecurringBill => ({
  id: r.id, name: r.name, amount: Number(r.amount), dueDay: r.due_day,
  category: r.category ?? undefined, paidMonth: r.paid_month ?? undefined, autoPay: r.auto_pay,
});

export function useFinance() {
  const { user } = useAuth();
  const [state, setState] = useState<FinanceState>(empty);
  const [loaded, setLoaded] = useState(false);
  const userIdRef = useRef<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    try {
      const [a, t, b, g, r] = await Promise.all([
        supabase.from("finance_accounts").select("*").order("created_at"),
        supabase.from("financial_transactions").select("*").order("date", { ascending: false }),
        supabase.from("finance_budgets").select("*"),
        supabase.from("finance_goals").select("*").order("created_at"),
        supabase.from("finance_recurring_bills").select("*").order("due_day"),
      ]);
      setState({
        accounts: (a.data ?? []).map(mapAccount),
        transactions: (t.data ?? []).map(mapTx),
        budgets: (b.data ?? []).map(mapBudget),
        goals: (g.data ?? []).map(mapGoal),
        recurringBills: (r.data ?? []).map(mapBill),
      });
      setLoaded(true);
    } catch (e) {
      console.error("[finance] load failed", e);
      toast.error("Falha ao carregar dados financeiros");
    }
  }, [user]);

  useEffect(() => {
    if (!user) { setState(empty); setLoaded(false); userIdRef.current = null; return; }
    userIdRef.current = user.id;
    reload();

    const channel = supabase
      .channel(`finance:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "finance_accounts", filter: `user_id=eq.${user.id}` }, reload)
      .on("postgres_changes", { event: "*", schema: "public", table: "financial_transactions", filter: `user_id=eq.${user.id}` }, reload)
      .on("postgres_changes", { event: "*", schema: "public", table: "finance_budgets", filter: `user_id=eq.${user.id}` }, reload)
      .on("postgres_changes", { event: "*", schema: "public", table: "finance_goals", filter: `user_id=eq.${user.id}` }, reload)
      .on("postgres_changes", { event: "*", schema: "public", table: "finance_recurring_bills", filter: `user_id=eq.${user.id}` }, reload)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, reload]);

  const uid = () => userIdRef.current;
  const guard = () => {
    if (!uid()) { toast.error("Faça login para salvar"); return false; }
    return true;
  };

  const addTransaction = useCallback(async (t: Omit<Transaction, "id">) => {
    if (!guard()) return;
    const { error } = await supabase.from("financial_transactions").insert({
      user_id: uid()!, account_id: t.accountId, type: t.type, amount: t.amount,
      category: t.category, description: t.description ?? "", date: t.date,
    });
    if (error) { console.error(error); toast.error("Erro ao salvar transação"); }
  }, []);

  const removeTransaction = useCallback(async (id: string) => {
    const { error } = await supabase.from("financial_transactions").delete().eq("id", id);
    if (error) { console.error(error); toast.error("Erro ao remover"); }
  }, []);

  const addAccount = useCallback(async (a: Omit<Account, "id">) => {
    if (!guard()) return;
    const { error } = await supabase.from("finance_accounts").insert({
      user_id: uid()!, name: a.name, type: a.type, initial_balance: a.initialBalance,
      color: a.color, credit_limit: a.creditLimit ?? null,
    });
    if (error) { console.error(error); toast.error("Erro ao criar conta"); }
  }, []);

  const removeAccount = useCallback(async (id: string) => {
    await supabase.from("financial_transactions").delete().eq("account_id", id);
    const { error } = await supabase.from("finance_accounts").delete().eq("id", id);
    if (error) { console.error(error); toast.error("Erro ao remover conta"); }
  }, []);

  const upsertBudget = useCallback(async (b: { category: string; limit: number }) => {
    if (!guard()) return;
    const { error } = await supabase.from("finance_budgets").upsert(
      { user_id: uid()!, category: b.category, limit: b.limit },
      { onConflict: "user_id,category" }
    );
    if (error) { console.error(error); toast.error("Erro ao salvar orçamento"); }
  }, []);

  const removeBudget = useCallback(async (id: string) => {
    const { error } = await supabase.from("finance_budgets").delete().eq("id", id);
    if (error) { console.error(error); toast.error("Erro ao remover"); }
  }, []);

  const addGoal = useCallback(async (g: Omit<Goal, "id">) => {
    if (!guard()) return;
    const { error } = await supabase.from("finance_goals").insert({
      user_id: uid()!, name: g.name, target: g.target, saved: g.saved ?? 0,
      deadline: g.deadline ?? null,
    });
    if (error) { console.error(error); toast.error("Erro ao criar meta"); }
  }, []);

  const updateGoal = useCallback(async (id: string, patch: Partial<Goal>) => {
    const dbPatch: any = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.target !== undefined) dbPatch.target = patch.target;
    if (patch.saved !== undefined) dbPatch.saved = patch.saved;
    if (patch.deadline !== undefined) dbPatch.deadline = patch.deadline ?? null;
    const { error } = await supabase.from("finance_goals").update(dbPatch).eq("id", id);
    if (error) { console.error(error); toast.error("Erro ao atualizar meta"); }
  }, []);

  const removeGoal = useCallback(async (id: string) => {
    const { error } = await supabase.from("finance_goals").delete().eq("id", id);
    if (error) { console.error(error); toast.error("Erro ao remover meta"); }
  }, []);

  const addRecurringBill = useCallback(async (b: Omit<RecurringBill, "id">) => {
    if (!guard()) return;
    const { error } = await supabase.from("finance_recurring_bills").insert({
      user_id: uid()!, name: b.name, amount: b.amount, due_day: b.dueDay,
      category: b.category ?? null, paid_month: b.paidMonth ?? null, auto_pay: b.autoPay ?? false,
    });
    if (error) { console.error(error); toast.error("Erro ao criar conta recorrente"); }
  }, []);

  const removeRecurringBill = useCallback(async (id: string) => {
    const { error } = await supabase.from("finance_recurring_bills").delete().eq("id", id);
    if (error) { console.error(error); toast.error("Erro ao remover"); }
  }, []);

  const toggleRecurringBillPaid = useCallback(async (id: string) => {
    const now = new Date();
    const cm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const bill = state.recurringBills.find((x) => x.id === id);
    if (!bill) return;
    const next = bill.paidMonth === cm ? null : cm;
    const { error } = await supabase.from("finance_recurring_bills").update({ paid_month: next }).eq("id", id);
    if (error) { console.error(error); toast.error("Erro ao atualizar"); }
  }, [state.recurringBills]);

  return {
    state, loaded,
    addTransaction, removeTransaction,
    addAccount, removeAccount,
    upsertBudget, removeBudget,
    addGoal, updateGoal, removeGoal,
    addRecurringBill, removeRecurringBill, toggleRecurringBillPaid,
  };
}

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
