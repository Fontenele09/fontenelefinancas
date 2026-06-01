import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Trash2, Plus, AlertTriangle } from "lucide-react";
import { formatBRL } from "@/hooks/use-finance";
import { EXPENSE_CATEGORIES, type Goal } from "@/lib/finance-types";
import { differenceInCalendarMonths, differenceInDays } from "date-fns";

export function GoalsPanel({
  goals, onAdd, onUpdate, onRemove,
}: {
  goals: Goal[];
  onAdd: (g: Omit<Goal, "id">) => Promise<boolean>;
  onUpdate: (id: string, patch: Partial<Goal>) => Promise<boolean>;
  onRemove: (id: string) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(target.replace(",", "."));
    if (!name || !v) return;
    const saved = await onAdd({
      name, target: v, saved: 0,
      deadline: deadline || undefined,
      category: category || undefined,
    });
    if (!saved) return;
    setName(""); setTarget(""); setDeadline(""); setCategory("");
  };

  return (
    <Card className="bg-gradient-card border-border/60 p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h3 className="font-display text-xl">Metas Financeiras</h3>
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-2 sm:grid-cols-2">
        <Input placeholder="Ex: Viagem" value={name} onChange={(e) => setName(e.target.value)} />
        <Input inputMode="decimal" placeholder="Valor alvo" value={target} onChange={(e) => setTarget(e.target.value)} />
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Prazo</Label>
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Opcional" /></SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" variant="secondary" className="sm:col-span-2"><Plus className="mr-1.5 h-4 w-4" /> Criar meta</Button>
      </form>

      <div className="mt-5 space-y-4">
        {goals.length === 0 && <p className="text-sm text-muted-foreground">Crie metas com valor e prazo para acompanhar seu progresso.</p>}
        {goals.map((g) => {
          const pct = Math.min(100, (g.saved / g.target) * 100);
          const remaining = Math.max(g.target - g.saved, 0);
          const now = new Date();
          const dl = g.deadline ? new Date(g.deadline) : null;
          const monthsLeft = dl ? Math.max(differenceInCalendarMonths(dl, now), 0) : null;
          const daysLeft = dl ? differenceInDays(dl, now) : null;
          const monthlyNeeded = monthsLeft && monthsLeft > 0 ? remaining / monthsLeft : remaining;
          const isCompleted = pct >= 100;
          const isNearDeadline = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30 && !isCompleted;
          const isOverdue = daysLeft !== null && daysLeft < 0 && !isCompleted;

          return (
            <div key={g.id} className="rounded-lg border border-border/50 bg-background/30 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-medium">{g.name}</p>
                    {g.category && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{g.category}</span>}
                    {isCompleted && <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] text-success">Concluída</span>}
                    {isOverdue && <span className="flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] text-destructive"><AlertTriangle className="h-2.5 w-2.5" />Vencida</span>}
                    {isNearDeadline && <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-400"><AlertTriangle className="h-2.5 w-2.5" />{daysLeft} dias</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemove(g.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-2 flex items-baseline justify-between text-sm text-muted-foreground">
                <span className="text-gradient-gold font-display text-lg">{formatBRL(g.saved)}</span>
                <span>de {formatBRL(g.target)} · {pct.toFixed(0)}%</span>
              </div>
              <Progress value={pct} className="mt-2 h-2 [&>div]:bg-gradient-premium" />

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Falta {formatBRL(remaining)}</span>
                {monthsLeft !== null && monthsLeft > 0 && !isCompleted && (
                  <span>~{formatBRL(monthlyNeeded)}/mês por {monthsLeft} {monthsLeft === 1 ? "mês" : "meses"}</span>
                )}
              </div>

              {!isCompleted && (
                <div className="mt-3">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Adicionar valor (Enter)"
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const v = parseFloat((e.target as HTMLInputElement).value.replace(",", "."));
                        if (v) {
                          onUpdate(g.id, { saved: g.saved + v });
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
