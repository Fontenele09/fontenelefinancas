import { Card } from "@/components/ui/card";
import { formatBRL } from "@/hooks/use-finance";
import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import type { FinanceState } from "@/lib/finance-types";

export function DashboardHero({ state }: { state: FinanceState }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const today = now.getDate();
  const cm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthTx = state.transactions.filter((t) => new Date(t.date) >= monthStart);
  const prevTx = state.transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= prevStart && d < monthStart;
  });

  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const result = income - expense;

  const prevIncome = prevTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const prevResult = prevIncome - prevExpense;

  const totalBalance = state.accounts.reduce((sum, a) => {
    const net = state.transactions
      .filter((t) => t.accountId === a.id)
      .reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);
    return sum + a.initialBalance + net;
  }, 0);

  const pendingRecurring = state.recurringBills
    .filter((b) => b.paidMonth !== cm && b.dueDay >= today && b.dueDay <= monthEnd.getDate())
    .reduce((s, b) => s + b.amount, 0);
  const projected = totalBalance - pendingRecurring;

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden border-border bg-surface p-7 shadow-elegant">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-silver opacity-[0.04] blur-3xl" />
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Patrimônio em contas</p>
        <p className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          <AnimatedNumber value={totalBalance} format={formatBRL} className={totalBalance >= 0 ? "text-foreground" : "text-loss"} />
        </p>
        {state.recurringBills.length > 0 && pendingRecurring > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Projeção fim de mês:{" "}
            <span className={projected < 0 ? "text-loss" : "text-foreground"}>{formatBRL(projected)}</span>
            <span className="text-muted-foreground/70"> · {formatBRL(pendingRecurring)} a vencer</span>
          </p>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniCard label="Receitas do mês" value={income} prev={prevIncome} positive icon={ArrowUpRight} />
        <MiniCard label="Despesas do mês" value={expense} prev={prevExpense} positive={false} icon={ArrowDownRight} />
        <MiniCard label="Resultado" value={result} prev={prevResult} positive={result >= 0} icon={result >= 0 ? TrendingUp : TrendingDown} />
      </div>
    </div>
  );
}

function MiniCard({
  label, value, prev, positive, icon: Icon,
}: { label: string; value: number; prev: number; positive: boolean; icon: any }) {
  const diff = value - prev;
  const pct = prev !== 0 ? (diff / Math.abs(prev)) * 100 : 0;
  // for expenses, lower is better
  const isGood = (label.startsWith("Despesa") ? diff < 0 : diff > 0) || (prev === 0 && value === 0);
  const arrowColor = isGood ? "text-money" : "text-loss";
  const Arrow = diff >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className={`h-3.5 w-3.5 ${positive ? "text-money" : "text-loss"}`} />
      </div>
      <p className={`mt-2 font-display text-2xl font-semibold ${positive ? "text-money" : "text-loss"}`}>
        <AnimatedNumber value={value} format={formatBRL} />
      </p>
      {prev !== 0 && (
        <div className={`mt-1 flex items-center gap-1 text-[11px] ${arrowColor}`}>
          <Arrow className="h-3 w-3" />
          <span>{Math.abs(pct).toFixed(0)}% vs mês anterior</span>
        </div>
      )}
    </Card>
  );
}
