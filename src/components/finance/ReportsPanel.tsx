import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { ArrowDown, ArrowUp, FileSpreadsheet, FileText, Minus } from "lucide-react";
import { formatBRL } from "@/hooks/use-finance";
import { exportTransactionsCSV, exportTransactionsPDF } from "@/lib/finance-export";
import type { FinanceState, Transaction } from "@/lib/finance-types";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = [
  "oklch(0.78 0.13 85)", "oklch(0.68 0.10 85)", "oklch(0.55 0.08 85)",
  "oklch(0.58 0.18 25)", "oklch(0.65 0.05 200)", "oklch(0.7 0.12 145)",
  "oklch(0.62 0.14 320)", "oklch(0.72 0.11 60)", "oklch(0.5 0.1 270)", "oklch(0.45 0.05 90)",
];

function getMonthOptions(months = 12) {
  return Array.from({ length: months }).map((_, i) => {
    const d = subMonths(new Date(), i);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: format(d, "MMMM yyyy", { locale: ptBR }),
      date: d,
    };
  });
}

function txInMonth(transactions: Transaction[], monthDate: Date) {
  const ms = startOfMonth(monthDate);
  const me = endOfMonth(monthDate);
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= ms && d <= me;
  });
}

export function ReportsPanel({ state }: { state: FinanceState }) {
  const monthOptions = useMemo(() => getMonthOptions(12), []);
  const [monthKey, setMonthKey] = useState(monthOptions[0].key);
  const selected = monthOptions.find((m) => m.key === monthKey) ?? monthOptions[0];

  const monthTx = useMemo(() => txInMonth(state.transactions, selected.date), [state.transactions, selected]);
  const prevTx = useMemo(() => txInMonth(state.transactions, subMonths(selected.date, 1)), [state.transactions, selected]);

  // Pie por categoria (despesas)
  const byCategory = useMemo(() => {
    const map = monthTx
      .filter((t) => t.type === "expense")
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + t.amount;
        return acc;
      }, {});
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthTx]);

  // Receita x Despesa últimos 6 meses (ancorado no mês selecionado)
  const trend = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(selected.date, 5 - i);
      const t = txInMonth(state.transactions, d);
      return {
        mes: format(d, "MMM/yy", { locale: ptBR }),
        Receitas: t.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0),
        Despesas: t.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0),
      };
    });
  }, [state.transactions, selected]);

  // Crescimento por categoria vs mês anterior
  const growth = useMemo(() => {
    const cur: Record<string, number> = {};
    const prev: Record<string, number> = {};
    monthTx.filter((t) => t.type === "expense").forEach((t) => { cur[t.category] = (cur[t.category] ?? 0) + t.amount; });
    prevTx.filter((t) => t.type === "expense").forEach((t) => { prev[t.category] = (prev[t.category] ?? 0) + t.amount; });
    const cats = Array.from(new Set([...Object.keys(cur), ...Object.keys(prev)]));
    return cats.map((c) => {
      const a = cur[c] ?? 0;
      const b = prev[c] ?? 0;
      const diff = a - b;
      const pct = b === 0 ? (a > 0 ? 100 : 0) : ((a - b) / b) * 100;
      return { category: c, current: a, previous: b, diff, pct };
    }).sort((x, y) => y.diff - x.diff);
  }, [monthTx, prevTx]);

  const subtitle = `${format(selected.date, "MMMM 'de' yyyy", { locale: ptBR })}`;

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-gradient-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Relatórios</h2>
            <p className="text-xs text-muted-foreground capitalize">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={monthKey} onValueChange={setMonthKey}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem key={m.key} value={m.key} className="capitalize">{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => exportTransactionsCSV(monthTx, state.accounts, "relatorio")}>
              <FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={() => exportTransactionsPDF(monthTx, state.accounts, "Relatório Financeiro", subtitle)}>
              <FileText className="mr-1 h-3.5 w-3.5" /> PDF
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-card border-border/60 p-6">
          <h3 className="font-display text-xl">Gastos por categoria</h3>
          {byCategory.length === 0 ? (
            <p className="mt-12 text-center text-sm text-muted-foreground">Sem despesas neste mês.</p>
          ) : (
            <>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                      {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }}
                      formatter={(v: number) => formatBRL(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
                {byCategory.map((c, i) => (
                  <li key={c.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="truncate text-muted-foreground">{c.name}</span>
                    <span className="ml-auto">{formatBRL(c.value)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card className="bg-gradient-card border-border/60 p-6">
          <h3 className="font-display text-xl">Receitas vs Despesas <span className="text-sm text-muted-foreground">· 6 meses</span></h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `R$${Math.round(v / 1000)}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }}
                  formatter={(v: number) => formatBRL(v)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Receitas" fill="oklch(0.7 0.13 145)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Despesas" fill="oklch(0.78 0.13 85)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="bg-gradient-card border-border/60 p-6">
        <h3 className="font-display text-xl">Categorias que mais cresceram</h3>
        <p className="text-xs text-muted-foreground">Comparativo vs {format(subMonths(selected.date, 1), "MMMM", { locale: ptBR })}</p>
        {growth.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">Sem dados de comparação.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2">Categoria</th>
                  <th className="py-2 text-right">Mês atual</th>
                  <th className="py-2 text-right">Mês anterior</th>
                  <th className="py-2 text-right">Variação</th>
                </tr>
              </thead>
              <tbody>
                {growth.map((g) => {
                  const Icon = g.diff > 0 ? ArrowUp : g.diff < 0 ? ArrowDown : Minus;
                  const color = g.diff > 0 ? "text-destructive" : g.diff < 0 ? "text-success" : "text-muted-foreground";
                  return (
                    <tr key={g.category} className="border-b border-border/40">
                      <td className="py-2.5 font-medium">{g.category}</td>
                      <td className="py-2.5 text-right">{formatBRL(g.current)}</td>
                      <td className="py-2.5 text-right text-muted-foreground">{formatBRL(g.previous)}</td>
                      <td className={`py-2.5 text-right ${color}`}>
                        <span className="inline-flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {g.previous === 0 && g.current > 0 ? "novo" : `${g.pct > 0 ? "+" : ""}${g.pct.toFixed(0)}%`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
