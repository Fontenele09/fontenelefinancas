import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/hooks/use-finance";
import type { Transaction } from "@/lib/finance-types";

export function SpendingHeatmap({ transactions }: { transactions: Transaction[] }) {
  const { days, max, monthLabel } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totals = new Array(daysInMonth).fill(0);
    transactions.forEach((t) => {
      if (t.type !== "expense") return;
      const d = new Date(t.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        totals[d.getDate() - 1] += t.amount;
      }
    });
    const max = Math.max(1, ...totals);
    const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const firstDow = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      amount: totals[i],
      dow: (firstDow + i) % 7,
    }));
    return { days, max, monthLabel };
  }, [transactions]);

  const intensity = (amt: number) => {
    if (amt === 0) return 0;
    return Math.min(1, amt / max);
  };

  const todayDay = new Date().getDate();

  return (
    <Card className="border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Mapa de gastos</h3>
        <span className="text-xs text-muted-foreground capitalize">{monthLabel}</span>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {["D","S","T","Q","Q","S","S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-muted-foreground">{d}</div>
        ))}
        {days[0] && Array.from({ length: days[0].dow }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map((d) => {
          const i = intensity(d.amount);
          const bg = d.amount === 0
            ? "var(--surface-2)"
            : `color-mix(in oklab, var(--loss) ${Math.round(i * 80) + 15}%, var(--surface-2))`;
          return (
            <div
              key={d.day}
              title={`${d.day}: ${formatBRL(d.amount)}`}
              className={`aspect-square rounded-md border text-[10px] flex items-center justify-center font-medium transition-colors ${
                d.day === todayDay ? "border-silver text-foreground" : "border-transparent text-foreground/70"
              }`}
              style={{ backgroundColor: bg }}
            >
              {d.day}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>menos</span>
        {[0.1, 0.3, 0.5, 0.75, 1].map((i) => (
          <div key={i} className="h-2.5 w-3 rounded-sm" style={{ backgroundColor: `color-mix(in oklab, var(--loss) ${Math.round(i * 80) + 15}%, var(--surface-2))` }} />
        ))}
        <span>mais</span>
      </div>
    </Card>
  );
}
