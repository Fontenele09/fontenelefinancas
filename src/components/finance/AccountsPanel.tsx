import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Wallet, CreditCard, Landmark, Coins, TrendingUp } from "lucide-react";
import { formatBRL } from "@/hooks/use-finance";
import { ACCOUNT_TYPE_LABEL, type Account, type Transaction } from "@/lib/finance-types";

const ICONS: Record<Account["type"], any> = {
  checking: Landmark, savings: Wallet, credit: CreditCard, cash: Coins, investment: TrendingUp,
};

export function AccountsPanel({
  accounts, transactions, onAdd, onRemove,
}: {
  accounts: Account[];
  transactions: Transaction[];
  onAdd: (a: Omit<Account, "id">) => Promise<boolean>;
  onRemove: (id: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("checking");
  const [initial, setInitial] = useState("");
  const [limit, setLimit] = useState("");

  const submit = async () => {
    if (!name) return;
    const saved = await onAdd({
      name,
      type,
      initialBalance: parseFloat(initial.replace(",", ".")) || 0,
      color: "#4f46e5",
      creditLimit: type === "credit" ? (parseFloat(limit.replace(",", ".")) || 0) : undefined,
    });
    if (!saved) return;
    setName(""); setInitial(""); setLimit(""); setType("checking"); setOpen(false);
  };

  const balance = (id: string, init: number) => {
    const net = transactions.filter((t) => t.accountId === id)
      .reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);
    return init + net;
  };

  const spentOnCard = (id: string) =>
    transactions.filter((t) => t.accountId === id && t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

  return (
    <Card className="bg-gradient-card border-border/60 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">Contas & Cartões</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm"><Plus className="mr-1 h-4 w-4" /> Nova</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova conta</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome (ex: Nubank)" value={name} onChange={(e) => setName(e.target.value)} />
              <Select value={type} onValueChange={(v) => setType(v as Account["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCOUNT_TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input inputMode="decimal" placeholder="Saldo inicial" value={initial} onChange={(e) => setInitial(e.target.value)} />
              {type === "credit" && (
                <Input inputMode="decimal" placeholder="Limite do cartão" value={limit} onChange={(e) => setLimit(e.target.value)} />
              )}
            </div>
            <DialogFooter>
              <Button onClick={submit} className="bg-gradient-premium text-primary-foreground">Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {accounts.map((a) => {
          const Icon = ICONS[a.type];
          const bal = balance(a.id, a.initialBalance);
          const isCredit = a.type === "credit";
          const spent = isCredit ? spentOnCard(a.id) : 0;
          const cardLimit = a.creditLimit ?? 0;
          const available = Math.max(cardLimit - spent, 0);
          const usagePct = cardLimit > 0 ? Math.min((spent / cardLimit) * 100, 100) : 0;

          return (
            <div key={a.id} className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-premium opacity-20 blur-2xl" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg border border-border/60 bg-card p-2">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{ACCOUNT_TYPE_LABEL[a.type]}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemove(a.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {isCredit ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total gasto</p>
                      <p className="font-display text-2xl text-destructive">{formatBRL(spent)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Limite</p>
                      <p className="font-display text-lg">{formatBRL(cardLimit)}</p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full bg-gradient-premium transition-all"
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Disponível: <span className="text-foreground">{formatBRL(available)}</span>
                    {cardLimit > 0 && <span> · {usagePct.toFixed(0)}% usado</span>}
                  </p>
                </div>
              ) : (
                <p className={`mt-3 font-display text-2xl ${bal < 0 ? "text-destructive" : "text-gradient-gold"}`}>
                  {formatBRL(bal)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
