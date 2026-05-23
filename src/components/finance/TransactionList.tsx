import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL } from "@/hooks/use-finance";
import type { Transaction, Account } from "@/lib/finance-types";

export function TransactionList({
  transactions, accounts, onRemove,
}: {
  transactions: Transaction[];
  accounts: Account[];
  onRemove: (id: string) => void;
}) {
  const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";
  const recent = transactions.slice(0, 30);

  return (
    <Card className="bg-gradient-card border-border/60 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">Transações Recentes</h3>
        <span className="text-xs text-muted-foreground">{transactions.length} no total</span>
      </div>

      {recent.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">Nenhuma transação ainda. Comece adicionando uma à direita.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border/50">
          {recent.map((t) => (
            <li key={t.id} className="group flex items-center gap-4 py-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${t.type === "income" ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
                {t.type === "income" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{t.description || t.category}</p>
                  <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
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
