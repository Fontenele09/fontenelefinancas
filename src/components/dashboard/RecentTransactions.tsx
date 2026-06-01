import { Card } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL } from "@/hooks/use-finance";
import type { Transaction, Account } from "@/lib/finance-types";

export function RecentTransactions({ transactions, accounts }: { transactions: Transaction[]; accounts: Account[] }) {
  const last = transactions.slice(0, 5);
  const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";

  return (
    <Card className="border-border bg-surface p-5">
      <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Últimas transações</h3>
      {last.length === 0 ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">Nada por aqui ainda.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {last.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${t.type === "income" ? "bg-money/10 text-money" : "bg-loss/10 text-loss"}`}>
                {t.type === "income" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.description || t.category}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {format(new Date(t.date), "dd MMM", { locale: ptBR })} · {accName(t.accountId)}
                </p>
              </div>
              <p className={`font-display text-sm ${t.type === "income" ? "text-money" : "text-loss"}`}>
                {t.type === "income" ? "+" : "−"} {formatBRL(t.amount)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
