import { Card } from "@/components/ui/card";
import { formatBRL } from "@/hooks/use-finance";
import { ArrowDownRight, ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import type { FinanceState } from "@/lib/finance-types";

export function DashboardHero({ state }: { state: FinanceState }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const today = now.getDate();
  const cm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthTx = state.transactions.filter((t) => new Date(t.date) >= monthStart);
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const result = income - expense;

  const totalBalance = state.accounts.reduce((sum, a) => {
    const net = state.transactions
      .filter((t) => t.accountId === a.id)
      .reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);
    return sum + a.initialBalance + net;
  }, 0);

  // Projeção: para cada conta recorrente não paga no mês com vencimento >= hoje, subtrai
  const pendingRecurring = state.recurringBills
    .filter((b) => b.paidMonth !== cm && b.dueDay >= today && b.dueDay <= monthEnd.getDate())
    .reduce((s, b) => s + b.amount, 0);
  const projected = totalBalance - pendingRecurring;

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden border-border/60 bg-gradient-card p-7 shadow-elegant">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-premium opacity-15 blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Saldo total
            </p>
            <p className="mt-3 font-display text-5xl font-semibold tracking-tight text-gradient-gold sm:text-6xl">
              {formatBRL(totalBalance)}
            </p>
            {state.recurringBills.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Projeção fim de mês:{" "}
                <span className={projected < 0 ? "text-destructive" : "text-foreground"}>
                  {formatBRL(projected)}
                </span>
                {pendingRecurring > 0 && (
                  <span className="text-muted-foreground/80"> · {formatBRL(pendingRecurring)} a vencer</span>
                )}
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniCard label="Receitas do mês" value={income} icon={ArrowUpRight} tone="success" />
        <MiniCard label="Despesas do mês" value={expense} icon={ArrowDownRight} tone="destructive" />
        <MiniCard label="Resultado" value={result} icon={TrendingUp} tone={result >= 0 ? "success" : "destructive"} />
      </div>
    </div>
  );
}

function MiniCard({
  label, value, icon: Icon, tone,
}: { label: string; value: number; icon: any; tone: "success" | "destructive" }) {
  return (
    <Card className="border-border/60 bg-gradient-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className={`h-3.5 w-3.5 ${tone === "success" ? "text-success" : "text-destructive"}`} />
      </div>
      <p className={`mt-2 font-display text-2xl font-semibold ${tone === "success" ? "text-success" : "text-destructive"}`}>
        {formatBRL(value)}
      </p>
    </Card>
  );
}
