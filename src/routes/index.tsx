import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useFinance } from "@/hooks/use-finance";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { usePin } from "@/hooks/use-pin";
import { PinGate } from "@/components/PinGate";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { SpendingHeatmap } from "@/components/dashboard/SpendingHeatmap";
import { MonthEvolutionChart } from "@/components/dashboard/MonthEvolutionChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { TransactionList } from "@/components/finance/TransactionList";
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
import { AppSidebar, MobileTabs, type SectionId } from "@/components/AppSidebar";
import { AvatarMenu } from "@/components/AvatarMenu";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Loader2 } from "lucide-react";

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
  const { theme, isDark } = useTheme();
  const pin = usePin();
  const f = useFinance();
  const [section, setSection] = useState<SectionId>("financas");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const totalBalance = useMemo(() => {
    return f.state.accounts.reduce((sum, a) => {
      const net = f.state.transactions
        .filter((t) => t.accountId === a.id)
        .reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);
      return sum + a.initialBalance + net;
    }, 0);
  }, [f.state.accounts, f.state.transactions]);

  if (loading || !user || !pin.ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!pin.unlocked) {
    return (
      <>
        <Toaster theme={isDark ? "dark" : "light"} position="top-right" richColors />
        <PinGate onVerify={pin.verify} />
      </>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Toaster theme={isDark ? "dark" : "light"} position="top-right" richColors />
      <AppSidebar active={section} onChange={setSection} />

      <div className="md:pl-16">
        <MobileTabs active={section} onChange={setSection} />

        <header className="sticky top-0 z-30 hidden border-b border-border bg-background/80 backdrop-blur md:block">
          <div className="mx-auto flex max-w-6xl items-center justify-end gap-2 px-6 py-3">
            <ThemeToggle />
            <AvatarMenu
              profile={profile}
              email={user.email}
              onOpenConfig={() => setSection("config")}
              onLock={pin.lock}
              hasPin={pin.hasPin}
              onSignOut={signOut}
            />
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-7 px-5 py-7 sm:px-6">
          {section === "financas" && (
            <>
              <Greeting profile={profile} user={user} totalBalance={totalBalance} />
              <DashboardHero state={f.state} />
              <div className="grid gap-5 lg:grid-cols-3">
                <div className="space-y-5 lg:col-span-2">
                  <MonthEvolutionChart transactions={f.state.transactions} />
                  <TransactionList
                    transactions={f.state.transactions}
                    accounts={f.state.accounts}
                    onRemove={f.removeTransaction}
                  />
                </div>
                <div className="space-y-5">
                  <SpendingHeatmap transactions={f.state.transactions} />
                  <RecentTransactions transactions={f.state.transactions} accounts={f.state.accounts} />
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
              <div className="grid gap-5 lg:grid-cols-2">
                <BudgetsPanel budgets={f.state.budgets} transactions={f.state.transactions} onUpsert={f.upsertBudget} onRemove={f.removeBudget} />
                <GoalsPanel goals={f.state.goals} onAdd={f.addGoal} onUpdate={f.updateGoal} onRemove={f.removeGoal} />
              </div>
            </>
          )}

          {section === "relatorios" && (
            <>
              <Greeting profile={profile} user={user} />
              <ReportsPanel state={f.state} />
            </>
          )}

          {section === "rotina" && (
            <>
              <Greeting profile={profile} user={user} />
              <RoutinePanel />
            </>
          )}

          {section === "kamilly" && (
            <>
              <Greeting profile={profile} user={user} />
              <SecretaryPanel finance={f.state} routine={{ tasks: [], completions: {} }} />
            </>
          )}

          {section === "config" && (
            <>
              <Greeting profile={profile} user={user} />
              <SettingsPanel hasPin={pin.hasPin} onSetPin={pin.setPin} onRemovePin={pin.removePin} />
            </>
          )}
        </main>
      </div>

      <QuickAddFAB accounts={f.state.accounts} onAdd={f.addTransaction} />

      {/* Theme indicator (current theme cycle hint) - hidden visually */}
      <span className="sr-only">Tema atual: {theme}</span>
    </div>
  );
}
