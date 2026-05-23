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
  onAdd: (a: Omit<Account, "id">) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("checking");
  const [initial, setInitial] = useState("");

  const submit = () => {
    if (!name) return;
    onAdd({ name, type, initialBalance: parseFloat(initial.replace(",", ".")) || 0, color: "#4f46e5" });
    setName(""); setInitial(""); setType("checking"); setOpen(false);
  };

  const balance = (id: string, init: number) => {
    const net = transactions.filter((t) => t.accountId === id)
      .reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);
    return init + net;
  };

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
                <Button variant="ghost" size="icon" className="opacity-0 transition-opacity group-hover:opacity-100" onClick={() => onRemove(a.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className={`mt-3 font-display text-2xl ${bal < 0 ? "text-destructive" : "text-gradient-gold"}`}>
                {formatBRL(bal)}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
