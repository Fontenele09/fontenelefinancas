import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Account, type TxType } from "@/lib/finance-types";

export function TransactionForm({
  accounts,
  onAdd,
}: {
  accounts: Account[];
  onAdd: (t: { accountId: string; type: TxType; amount: number; category: string; description: string; date: string }) => Promise<boolean>;
}) {
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) return toast.error("Informe um valor válido");
    if (!category) return toast.error("Escolha uma categoria");
    if (!accountId) return toast.error("Cadastre uma conta primeiro");
    const saved = await onAdd({ accountId, type, amount: value, category, description, date: new Date(date).toISOString() });
    if (!saved) return;
    setAmount(""); setDescription("");
    toast.success(type === "income" ? "Receita registrada" : "Despesa registrada");
  };

  return (
    <Card className="bg-gradient-card border-border/60 p-6">
      <h3 className="font-display text-xl">Nova Transação</h3>
      <Tabs value={type} onValueChange={(v) => { setType(v as TxType); setCategory(""); }} className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expense">Despesa</TabsTrigger>
          <TabsTrigger value="income">Receita</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Valor</Label>
            <Input inputMode="decimal" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecionar" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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

        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Descrição</Label>
          <Input placeholder="Opcional" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" />
        </div>

        <Button type="submit" className="w-full bg-gradient-premium text-primary-foreground shadow-elegant hover:opacity-95">
          <Plus className="mr-1.5 h-4 w-4" /> Adicionar
        </Button>
      </form>
    </Card>
  );
}
