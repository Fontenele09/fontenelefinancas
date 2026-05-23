import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Trash2, Plus } from "lucide-react";
import { formatBRL } from "@/hooks/use-finance";
import type { Goal } from "@/lib/finance-types";

export function GoalsPanel({
  goals, onAdd, onUpdate, onRemove,
}: {
  goals: Goal[];
  onAdd: (g: Omit<Goal, "id">) => void;
  onUpdate: (id: string, patch: Partial<Goal>) => void;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(target.replace(",", "."));
    if (!name || !v) return;
    onAdd({ name, target: v, saved: 0 });
    setName(""); setTarget("");
  };

  return (
    <Card className="bg-gradient-card border-border/60 p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h3 className="font-display text-xl">Metas de Economia</h3>
      </div>

      <form onSubmit={submit} className="mt-4 grid grid-cols-[1fr_120px_auto] gap-2">
        <Input placeholder="Ex: Viagem" value={name} onChange={(e) => setName(e.target.value)} />
        <Input inputMode="decimal" placeholder="Meta" value={target} onChange={(e) => setTarget(e.target.value)} />
        <Button type="submit" variant="secondary"><Plus className="h-4 w-4" /></Button>
      </form>

      <div className="mt-5 space-y-4">
        {goals.length === 0 && <p className="text-sm text-muted-foreground">Crie metas para visualizar seu progresso.</p>}
        {goals.map((g) => {
          const pct = Math.min(100, (g.saved / g.target) * 100);
          return (
            <div key={g.id} className="rounded-lg border border-border/50 bg-background/30 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{g.name}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemove(g.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-sm text-muted-foreground">
                <span className="text-gradient-gold font-display text-lg">{formatBRL(g.saved)}</span>
                <span>de {formatBRL(g.target)}</span>
              </div>
              <Progress value={pct} className="mt-2 h-2 [&>div]:bg-gradient-premium" />
              <div className="mt-3 flex gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Adicionar valor"
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
            </div>
          );
        })}
      </div>
    </Card>
  );
}
