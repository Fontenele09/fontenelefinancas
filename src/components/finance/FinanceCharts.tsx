import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatBRL } from "@/hooks/use-finance";
import type { Transaction } from "@/lib/finance-types";
import { format, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["oklch(0.78 0.13 85)", "oklch(0.55 0.22 280)", "oklch(0.72 0.17 155)", "oklch(0.65 0.23 25)", "oklch(0.68 0.18 200)", "oklch(0.7 0.2 320)", "oklch(0.75 0.15 60)"];

export function FinanceCharts({ transactions }: { transactions: Transaction[] }) {
  const monthStart = startOfMonth(new Date());
  const monthExpenses = transactions.filter((t) => t.type === "expense" && new Date(t.date) >= monthStart);

  const byCategory = Object.entries(
    monthExpenses.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // últimos 6 meses
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = startOfMonth(subMonths(new Date(), 5 - i));
    return { date: d, label: format(d, "MMM", { locale: ptBR }) };
  });
  const trend = months.map(({ date, label }) => {
    const next = startOfMonth(subMonths(date, -1));
    const monthTx = transactions.filter((t) => {
      const td = new Date(t.date);
      return td >= date && td < next;
    });
    return {
      mes: label,
      Receitas: monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      Despesas: monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="bg-gradient-card border-border/60 p-6">
        <h3 className="font-display text-xl">Gastos por categoria <span className="text-sm text-muted-foreground">· este mês</span></h3>
        {byCategory.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">Sem despesas neste mês.</p>
        ) : (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "oklch(0.18 0.04 270)", border: "1px solid oklch(0.28 0.03 270)", borderRadius: 12, color: "oklch(0.96 0.01 90)" }}
                  formatter={(v: number) => formatBRL(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {byCategory.length > 0 && (
          <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
            {byCategory.slice(0, 6).map((c, i) => (
              <li key={c.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="truncate text-muted-foreground">{c.name}</span>
                <span className="ml-auto">{formatBRL(c.value)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="bg-gradient-card border-border/60 p-6">
        <h3 className="font-display text-xl">Receitas vs Despesas <span className="text-sm text-muted-foreground">· 6 meses</span></h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.03 270)" />
              <XAxis dataKey="mes" stroke="oklch(0.72 0.02 270)" fontSize={12} />
              <YAxis stroke="oklch(0.72 0.02 270)" fontSize={12} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{ background: "oklch(0.18 0.04 270)", border: "1px solid oklch(0.28 0.03 270)", borderRadius: 12, color: "oklch(0.96 0.01 90)" }}
                formatter={(v: number) => formatBRL(v)}
              />
              <Bar dataKey="Receitas" fill="oklch(0.72 0.17 155)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Despesas" fill="oklch(0.78 0.13 85)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
