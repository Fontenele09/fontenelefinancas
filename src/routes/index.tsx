import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/hooks/use-finance";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { TransactionList } from "@/components/finance/TransactionList";
import { FinanceCharts } from "@/components/finance/FinanceCharts";
import { ReportsPanel } from "@/components/finance/ReportsPanel";
import { BudgetsPanel } from "@/components/finance/BudgetsPanel";
import { GoalsPanel } from "@/components/finance/GoalsPanel";
import { AccountsPanel } from "@/components/finance/AccountsPanel";
import { RecurringBillsPanel } from "@/components/finance/RecurringBillsPanel";
import { QuickAddFAB } from "@/components/finance/QuickAddFAB";
import { RoutinePanel } from "@/components/routine/RoutinePanel";
import { SecretaryPanel } from "@/components/secretary/SecretaryPanel";
import { Greeting } from "@/components/dashboard/Greeting";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, Wallet, ListChecks, Crown, LogOut, Loader2, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FONTENELE — Organização pessoal" },
      { name: "description", content: "Dashboard premium para sua rotina e finanças." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const { theme } = useTheme();
  const f = useFinance();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Toaster theme={theme} position="top-right" richColors />

      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-premium shadow-elegant">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg tracking-tight">FONTENELE</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-6">
        <Greeting profile={profile} user={user} />

        <Tabs defaultValue="financas" className="w-full">
          <TabsList className="h-11 w-full justify-start gap-1 bg-muted/30 p-1 sm:w-auto">
            <TabsTrigger value="financas" className="gap-1.5 px-4">
              <Wallet className="h-4 w-4" /> Finanças
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="gap-1.5 px-4">
              <BarChart3 className="h-4 w-4" /> Relatórios
            </TabsTrigger>
            <TabsTrigger value="rotina" className="gap-1.5 px-4">
              <ListChecks className="h-4 w-4" /> Rotina
            </TabsTrigger>
            <TabsTrigger value="kamilly" className="gap-1.5 px-4">
              <Crown className="h-4 w-4" /> Kamilly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="financas" className="mt-6 space-y-6">
            <DashboardHero state={f.state} />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <FinanceCharts transactions={f.state.transactions} />
                <TransactionList
                  transactions={f.state.transactions}
                  accounts={f.state.accounts}
                  onRemove={f.removeTransaction}
                />
              </div>
              <div className="space-y-6">
                <TransactionForm accounts={f.state.accounts} onAdd={f.addTransaction} />
                <RecurringBillsPanel
                  bills={f.state.recurringBills}
                  onAdd={f.addRecurringBill}
                  onRemove={f.removeRecurringBill}
                  onTogglePaid={f.toggleRecurringBillPaid}
                />
              </div>
            </div>
            <AccountsPanel accounts={f.state.accounts} transactions={f.state.transactions} onAdd={f.addAccount} onRemove={f.removeAccount} />
            <div className="grid gap-6 lg:grid-cols-2">
              <BudgetsPanel budgets={f.state.budgets} transactions={f.state.transactions} onUpsert={f.upsertBudget} onRemove={f.removeBudget} />
              <GoalsPanel goals={f.state.goals} onAdd={f.addGoal} onUpdate={f.updateGoal} onRemove={f.removeGoal} />
            </div>
          </TabsContent>

          <TabsContent value="rotina" className="mt-6">
            <RoutinePanel />
          </TabsContent>

          <TabsContent value="relatorios" className="mt-6">
            <ReportsPanel state={f.state} />
          </TabsContent>

          <TabsContent value="kamilly" className="mt-6">
            <SecretaryPanel finance={f.state} routine={{ tasks: [], completions: {} }} />
          </TabsContent>
        </Tabs>
      </main>

      <QuickAddFAB accounts={f.state.accounts} onAdd={f.addTransaction} />
    </div>
  );
}
