import { useEffect, useState, useCallback } from "react";
import type { FinanceState, Account, Transaction, Budget, Goal } from "@/lib/finance-types";

const STORAGE_KEY = "finance:v1";

const seed: FinanceState = {
  accounts: [
    { id: crypto.randomUUID(), name: "Conta Principal", type: "checking", initialBalance: 0, color: "#4f46e5" },
  ],
  transactions: [],
  budgets: [],
  goals: [],
};

function load(): FinanceState {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    return JSON.parse(raw) as FinanceState;
  } catch {
    return seed;
  }
}

export function useFinance() {
  const [state, setState] = useState<FinanceState>(seed);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setState(load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setState((s) => ({ ...s, transactions: [{ ...t, id: crypto.randomUUID() }, ...s.transactions] }));
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));
  }, []);

  const addAccount = useCallback((a: Omit<Account, "id">) => {
    setState((s) => ({ ...s, accounts: [...s.accounts, { ...a, id: crypto.randomUUID() }] }));
  }, []);

  const removeAccount = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      accounts: s.accounts.filter((a) => a.id !== id),
      transactions: s.transactions.filter((t) => t.accountId !== id),
    }));
  }, []);

  const upsertBudget = useCallback((b: Omit<Budget, "id"> & { id?: string }) => {
    setState((s) => {
      const existing = s.budgets.find((x) => x.category === b.category);
      if (existing) {
        return { ...s, budgets: s.budgets.map((x) => x.id === existing.id ? { ...x, limit: b.limit } : x) };
      }
      return { ...s, budgets: [...s.budgets, { ...b, id: crypto.randomUUID() }] };
    });
  }, []);

  const removeBudget = useCallback((id: string) => {
    setState((s) => ({ ...s, budgets: s.budgets.filter((b) => b.id !== id) }));
  }, []);

  const addGoal = useCallback((g: Omit<Goal, "id">) => {
    setState((s) => ({ ...s, goals: [...s.goals, { ...g, id: crypto.randomUUID() }] }));
  }, []);

  const updateGoal = useCallback((id: string, patch: Partial<Goal>) => {
    setState((s) => ({ ...s, goals: s.goals.map((g) => g.id === id ? { ...g, ...patch } : g) }));
  }, []);

  const removeGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
  }, []);

  return {
    state, loaded,
    addTransaction, removeTransaction,
    addAccount, removeAccount,
    upsertBudget, removeBudget,
    addGoal, updateGoal, removeGoal,
  };
}

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
