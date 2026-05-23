import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useFinance } from "@/hooks/use-finance";
import { SummaryCards } from "@/components/finance/SummaryCards";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { TransactionList } from "@/components/finance/TransactionList";
import { FinanceCharts } from "@/components/finance/FinanceCharts";
import { BudgetsPanel } from "@/components/finance/BudgetsPanel";
import { GoalsPanel } from "@/components/finance/GoalsPanel";
import { AccountsPanel } from "@/components/finance/AccountsPanel";
import { RecurringBillsPanel } from "@/components/finance/RecurringBillsPanel";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FONTENELE — Organização Financeira" },
      { name: "description", content: "Painel premium para organizar receitas, despesas, orçamentos e metas financeiras." },
      { property: "og:title", content: "FONTENELE — Organização Financeira" },
      { property: "og:description", content: "Painel premium para organizar suas finanças pessoais." },
    ],
  }),
  component: Index,
});

function Index() {
  const f = useFinance();

  return (
    <div className="min-h-screen pb-20">
      <Toaster theme="dark" position="top-right" richColors />

      <header className="border-b border-border/50 bg-background/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-premium shadow-gold">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl leading-none">FONTENELE</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Finanças pessoais</p>
            </div>
          </div>
          <p className="hidden text-xs text-muted-foreground md:block">
            Seus dados ficam salvos neste navegador.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <section>
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Painel</p>
          <h2 className="mt-1 font-display text-4xl">
            Suas finanças, <span className="text-gradient-gold">organizadas</span>.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Substitua sua planilha por um painel completo: lance receitas e despesas, acompanhe orçamentos, metas e o saldo de cada conta.
          </p>
        </section>

        <SummaryCards state={f.state} />

        <FinanceCharts transactions={f.state.transactions} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TransactionList
              transactions={f.state.transactions}
              accounts={f.state.accounts}
              onRemove={f.removeTransaction}
            />
          </div>
          <div>
            <TransactionForm accounts={f.state.accounts} onAdd={f.addTransaction} />
          </div>
        </div>

        <AccountsPanel
          accounts={f.state.accounts}
          transactions={f.state.transactions}
          onAdd={f.addAccount}
          onRemove={f.removeAccount}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <BudgetsPanel
            budgets={f.state.budgets}
            transactions={f.state.transactions}
            onUpsert={f.upsertBudget}
            onRemove={f.removeBudget}
          />
          <GoalsPanel
            goals={f.state.goals}
            onAdd={f.addGoal}
            onUpdate={f.updateGoal}
            onRemove={f.removeGoal}
          />
        </div>
      </main>
    </div>
  );
}
