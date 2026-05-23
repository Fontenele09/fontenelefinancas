import { Card } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Wallet, TrendingUp } from "lucide-react";
import { formatBRL } from "@/hooks/use-finance";
import type { FinanceState } from "@/lib/finance-types";

export function SummaryCards({ state }: { state: FinanceState }) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthTx = state.transactions.filter((t) => new Date(t.date) >= monthStart);
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const totalBalance = state.accounts.reduce((sum, a) => {
    const tx = state.transactions.filter((t) => t.accountId === a.id);
    const net = tx.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);
    return sum + a.initialBalance + net;
  }, 0);

  const items = [
    { label: "Saldo Total", value: totalBalance, icon: Wallet, accent: "text-gradient-gold", glow: "shadow-gold" },
    { label: "Receitas do mês", value: income, icon: ArrowUpRight, accent: "text-success" },
    { label: "Despesas do mês", value: expense, icon: ArrowDownRight, accent: "text-destructive" },
    { label: "Resultado", value: income - expense, icon: TrendingUp, accent: income - expense >= 0 ? "text-success" : "text-destructive" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label} className={`bg-gradient-card border-border/60 p-6 ${it.glow ?? ""}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{it.label}</p>
              <p className={`mt-3 font-display text-3xl font-semibold ${it.accent}`}>
                {formatBRL(it.value)}
              </p>
            </div>
            <div className="rounded-full border border-border/60 bg-background/40 p-2.5">
              <it.icon className="h-4 w-4 text-accent" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
