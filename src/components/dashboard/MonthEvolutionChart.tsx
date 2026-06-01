import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBRL } from "@/hooks/use-finance";
import type { Transaction } from "@/lib/finance-types";

export function MonthEvolutionChart({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; balance: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        balance: 0,
      });
    }
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.find((x) => x.key === k);
      if (m) m.balance += t.type === "income" ? t.amount : -t.amount;
    });
    return months;
  }, [transactions]);

  return (
    <Card className="border-border bg-surface p-5">
      <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Evolução do saldo</h3>
      <p className="mt-1 text-xs text-muted-foreground">Últimos 6 meses</p>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-balance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--silver)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--silver)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v/1000)}k`} />
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(v: number) => [formatBRL(v), "Resultado"]}
            />
            <Area type="monotone" dataKey="balance" stroke="var(--silver)" strokeWidth={2} fill="url(#grad-balance)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
