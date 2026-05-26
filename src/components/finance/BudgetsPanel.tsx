import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Target } from "lucide-react";
import { formatBRL } from "@/hooks/use-finance";
import { EXPENSE_CATEGORIES, type Budget, type Transaction } from "@/lib/finance-types";
import { startOfMonth } from "date-fns";

export function BudgetsPanel({
  budgets, transactions, onUpsert, onRemove,
}: {
  budgets: Budget[];
  transactions: Transaction[];
  onUpsert: (b: { category: string; limit: number }) => Promise<boolean>;
  onRemove: (id: string) => Promise<boolean>;
}) {
  const [cat, setCat] = useState("");
  const [limit, setLimit] = useState("");

  const monthStart = startOfMonth(new Date());
  const spentByCat = transactions
    .filter((t) => t.type === "expense" && new Date(t.date) >= monthStart)
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(limit.replace(",", "."));
    if (!cat || !v) return;
    const saved = await onUpsert({ category: cat, limit: v });
    if (!saved) return;
    setCat(""); setLimit("");
  };

  return (
    <Card className="bg-gradient-card border-border/60 p-6">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-accent" />
        <h3 className="font-display text-xl">Orçamentos</h3>
      </div>

      <form onSubmit={submit} className="mt-4 grid grid-cols-[1fr_120px_auto] gap-2">
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input inputMode="decimal" placeholder="Limite" value={limit} onChange={(e) => setLimit(e.target.value)} />
        <Button type="submit" variant="secondary">Definir</Button>
      </form>

      <div className="mt-5 space-y-4">
        {budgets.length === 0 && <p className="text-sm text-muted-foreground">Defina limites por categoria para acompanhar seus gastos.</p>}
        {budgets.map((b) => {
          const spent = spentByCat[b.category] ?? 0;
          const pct = Math.min(100, (spent / b.limit) * 100);
          const over = spent > b.limit;
          return (
            <div key={b.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{b.category}</span>
                <div className="flex items-center gap-2">
                  <span className={over ? "text-destructive" : "text-muted-foreground"}>
                    {formatBRL(spent)} / {formatBRL(b.limit)}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemove(b.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Progress value={pct} className={`mt-2 h-2 ${over ? "[&>div]:bg-destructive" : "[&>div]:bg-gradient-premium"}`} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
