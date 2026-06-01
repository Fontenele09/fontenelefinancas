import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Repeat, AlertTriangle, CalendarCheck, Clock } from "lucide-react";
import { formatBRL } from "@/hooks/use-finance";
import { EXPENSE_CATEGORIES, FREQUENCY_LABEL, FREQUENCY_PER_MONTH, type Frequency, type RecurringBill } from "@/lib/finance-types";

function getStatus(dueDay: number, paidMonth?: string) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const today = now.getDate();

  if (paidMonth === currentMonth) return { label: "Pago", variant: "success" as const };
  if (dueDay < today) return { label: "Atrasado", variant: "destructive" as const };
  if (dueDay === today) return { label: "Vence hoje", variant: "warning" as const };
  if (dueDay <= today + 3) return { label: "Próximo", variant: "warning" as const };
  return { label: "Em dia", variant: "neutral" as const };
}

export function RecurringBillsPanel({
  bills, onAdd, onRemove, onTogglePaid,
}: {
  bills: RecurringBill[];
  onAdd: (b: Omit<RecurringBill, "id">) => Promise<boolean>;
  onRemove: (id: string) => Promise<boolean>;
  onTogglePaid: (id: string) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("monthly");

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // total comprometido por mês considerando frequência
  const monthlyCommitted = bills.reduce((s, b) => s + b.amount * FREQUENCY_PER_MONTH[b.frequency], 0);
  const monthlyBills = bills.filter((b) => b.frequency === "monthly");
  const paid = monthlyBills.filter((b) => b.paidMonth === currentMonth).reduce((s, b) => s + b.amount, 0);
  const pending = monthlyBills.reduce((s, b) => s + b.amount, 0) - paid;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(amount.replace(",", "."));
    const d = parseInt(dueDay, 10);
    if (!name || !v || !d || d < 1 || d > 31) return;
    const saved = await onAdd({ name, amount: v, dueDay: d, frequency, category: category || undefined, paidMonth: undefined });
    if (!saved) return;
    setName(""); setAmount(""); setDueDay(""); setCategory(""); setFrequency("monthly");
  };

  return (
    <Card className="bg-gradient-card border-border/60 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="h-5 w-5 text-accent" />
          <h3 className="font-display text-xl">Assinaturas & Recorrentes</h3>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border/50 bg-background/30 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Comprometido/mês</p>
          <p className="font-display text-lg text-gradient-gold">{formatBRL(monthlyCommitted)}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-background/30 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pago (mensais)</p>
          <p className="font-display text-lg text-success">{formatBRL(paid)}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-background/30 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pendente</p>
          <p className="font-display text-lg">{formatBRL(pending)}</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input placeholder="Nome (ex: Netflix)" value={name} onChange={(e) => setName(e.target.value)} />
        <Input inputMode="decimal" placeholder="Valor" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input inputMode="numeric" placeholder="Dia venc. (1-31)" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
        <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(FREQUENCY_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">Adicionar</Button>
      </form>

      <div className="mt-5 space-y-2">
        {bills.length === 0 && (
          <p className="text-sm text-muted-foreground">Adicione assinaturas e contas fixas para acompanhar vencimentos.</p>
        )}
        {bills.map((b) => {
          const status = getStatus(b.dueDay, b.paidMonth);
          const isPaid = b.paidMonth === currentMonth;
          const StatusIcon = status.variant === "destructive" ? AlertTriangle : status.variant === "warning" ? Clock : CalendarCheck;
          return (
            <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border/50 bg-background/40 px-3 py-2.5">
              <Checkbox
                checked={isPaid}
                onCheckedChange={() => onTogglePaid(b.id)}
                className="border-accent data-[state=checked]:bg-accent data-[state=checked]:text-primary-foreground"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className={`truncate font-medium ${isPaid ? "line-through text-muted-foreground" : ""}`}>{b.name}</p>
                  <Badge variant="outline" className="text-[10px]">{FREQUENCY_LABEL[b.frequency]}</Badge>
                  {b.category && <Badge variant="secondary" className="text-[10px]">{b.category}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">Vence dia {b.dueDay}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isPaid ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {formatBRL(b.amount)}
                </span>
                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  status.variant === "success" ? "bg-success/10 text-success" :
                  status.variant === "destructive" ? "bg-destructive/10 text-destructive" :
                  status.variant === "warning" ? "bg-amber-500/10 text-amber-400" :
                  "bg-muted text-muted-foreground"
                }`}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove(b.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
