import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, CreditCard } from "lucide-react";
import { formatBRL } from "@/hooks/use-finance";
import { ACCOUNT_TYPE_LABEL, BANK_PRESETS, type Account, type Transaction } from "@/lib/finance-types";

export function AccountsPanel({
  accounts, transactions, onAdd, onRemove,
}: {
  accounts: Account[];
  transactions: Transaction[];
  onAdd: (a: Omit<Account, "id">) => Promise<boolean>;
  onRemove: (id: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<string>("nubank");
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("checking");
  const [initial, setInitial] = useState("");
  const [limit, setLimit] = useState("");

  const chosenPreset = BANK_PRESETS.find((b) => b.id === preset);

  const selectPreset = (id: string) => {
    setPreset(id);
    const p = BANK_PRESETS.find((b) => b.id === id);
    if (p) {
      setName((curr) => (curr && !BANK_PRESETS.some((bp) => bp.name === curr) ? curr : p.name));
      setType(p.type);
    }
  };

  const submit = async () => {
    const finalName = name || chosenPreset?.name || "Conta";
    const color = chosenPreset?.color || "#6B7280";
    const saved = await onAdd({
      name: finalName,
      type,
      initialBalance: parseFloat(initial.replace(",", ".")) || 0,
      color,
      creditLimit: type === "credit" ? (parseFloat(limit.replace(",", ".")) || 0) : undefined,
    });
    if (!saved) return;
    setName(""); setInitial(""); setLimit(""); setType("checking"); setPreset("nubank"); setOpen(false);
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
        <h3 className="font-display text-xl">Minhas carteiras</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm"><Plus className="mr-1 h-4 w-4" /> Nova</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova carteira</DialogTitle></DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Banco / Carteira</Label>
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {BANK_PRESETS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => selectPreset(b.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-all ${
                        preset === b.id ? "border-primary shadow-gold" : "border-border/60 hover:border-border"
                      }`}
                      title={b.name}
                    >
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold"
                        style={{ background: b.color, color: b.id === "bb" ? "#000" : "#fff" }}
                      >
                        {b.initials}
                      </span>
                      <span className="line-clamp-1 text-[10px] text-muted-foreground">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Apelido</Label>
                  <Input
                    placeholder={chosenPreset?.name ?? "Nome"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tipo</Label>
                  <Select value={type} onValueChange={(v) => setType(v as Account["type"])}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ACCOUNT_TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Saldo inicial</Label>
                  <Input inputMode="decimal" placeholder="0,00" value={initial} onChange={(e) => setInitial(e.target.value)} className="mt-1.5" />
                </div>
                {type === "credit" && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Limite</Label>
                    <Input inputMode="decimal" placeholder="0,00" value={limit} onChange={(e) => setLimit(e.target.value)} className="mt-1.5" />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={submit} className="bg-gradient-premium text-primary-foreground">Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {accounts.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">
            Adicione sua primeira carteira para começar.
          </p>
        )}
        {accounts.map((a) => {
          const bal = balance(a.id, a.initialBalance);
          const isCredit = a.type === "credit";
          const spent = isCredit ? spentOnCard(a.id) : 0;
          const cardLimit = a.creditLimit ?? 0;
          const available = Math.max(cardLimit - spent, 0);
          const usagePct = cardLimit > 0 ? Math.min((spent / cardLimit) * 100, 100) : 0;
          const initials = (a.name.match(/\b\w/g) || []).slice(0, 2).join("").toUpperCase() || "?";

          return (
            <div key={a.id} className="group relative overflow-hidden rounded-xl border border-border/60 bg-background/40 p-4">
              <div
                className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-30 blur-2xl"
                style={{ background: a.color }}
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ background: a.color, color: a.color.toLowerCase() === "#ffef38" ? "#000" : "#fff" }}
                  >
                    {isCredit ? <CreditCard className="h-4 w-4" /> : initials}
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
                    <div className="h-full rounded-full bg-gradient-premium transition-all" style={{ width: `${usagePct}%` }} />
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
