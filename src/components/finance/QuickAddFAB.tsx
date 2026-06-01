import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Account, type TxType } from "@/lib/finance-types";

export function QuickAddFAB({
  accounts,
  onAdd,
}: {
  accounts: Account[];
  onAdd: (t: { accountId: string; type: TxType; amount: number; category: string; description: string; date: string; tags: string[] }) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setAccountId((id) => id || accounts[0]?.id || "");
      setTimeout(() => amountRef.current?.focus(), 80);
    }
  }, [open, accounts]);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const cats = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(amount.replace(",", "."));
    if (!v || v <= 0) return toast.error("Informe um valor válido");
    if (!category) return toast.error("Escolha uma categoria");
    if (!accountId) return toast.error("Cadastre uma conta primeiro");
    const ok = await onAdd({
      accountId, type, amount: v, category, description,
      date: new Date().toISOString(), tags: [],
    });
    if (!ok) return;
    toast.success(type === "income" ? "Receita registrada" : "Despesa registrada");
    setAmount(""); setCategory(""); setDescription("");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Lançamento rápido (Cmd+K)"
        title="Lançamento rápido — ⌘K"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-premium text-primary-foreground shadow-elegant transition-transform hover:scale-105 active:scale-95 sm:bottom-8 sm:right-8"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Lançamento rápido</span>
              <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <Tabs value={type} onValueChange={(v) => { setType(v as TxType); setCategory(""); }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense">Saída</TabsTrigger>
                <TabsTrigger value="income">Entrada</TabsTrigger>
              </TabsList>
            </Tabs>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Valor</Label>
              <Input
                ref={amountRef}
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1.5 h-12 text-2xl font-display"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {cats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Conta</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Descrição (opcional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" />
            </div>

            <Button type="submit" className="h-11 w-full bg-gradient-premium text-primary-foreground shadow-elegant hover:opacity-95">
              Salvar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
