import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowDownLeft, ArrowUpRight, Search, FileText, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL } from "@/hooks/use-finance";
import { exportTransactionsCSV, exportTransactionsPDF } from "@/lib/finance-export";
import type { Transaction, Account } from "@/lib/finance-types";

export function TransactionList({
  transactions, accounts, onRemove,
}: {
  transactions: Transaction[];
  accounts: Account[];
  onRemove: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";

  const filtered = useMemo(() => {
    if (!q.trim()) return transactions;
    const needle = q.toLowerCase().replace(/^#/, "");
    return transactions.filter((t) =>
      (t.description ?? "").toLowerCase().includes(needle) ||
      t.category.toLowerCase().includes(needle) ||
      (t.tags ?? []).some((tag) => tag.toLowerCase().includes(needle))
    );
  }, [transactions, q]);

  return (
    <Card className="bg-gradient-card border-border/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl">Transações</h3>
        <div className="flex items-center gap-1">
          <span className="mr-2 text-xs text-muted-foreground">{filtered.length} de {transactions.length}</span>
          <Button variant="ghost" size="sm" onClick={() => exportTransactionsCSV(filtered, accounts)} title="Exportar CSV">
            <FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={() => exportTransactionsPDF(filtered, accounts)} title="Exportar PDF">
            <FileText className="mr-1 h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por descrição, categoria ou #tag"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">Nenhuma transação encontrada.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border/50">
          {filtered.slice(0, 60).map((t) => (
            <li key={t.id} className="group flex items-center gap-4 py-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${t.type === "income" ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
                {t.type === "income" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate font-medium">{t.description || t.category}</p>
                  <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
                  {(t.tags ?? []).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">#{tag}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(t.date), "dd MMM yyyy", { locale: ptBR })} · {accName(t.accountId)}
                </p>
              </div>
              <p className={`font-display text-lg ${t.type === "income" ? "text-success" : "text-foreground"}`}>
                {t.type === "income" ? "+" : "−"} {formatBRL(t.amount)}
              </p>
              <Button variant="ghost" size="icon" onClick={() => onRemove(t.id)} className="opacity-0 transition-opacity group-hover:opacity-100">
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
