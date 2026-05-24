import { useMemo, useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useServerFn } from "@tanstack/react-start";
import { Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { askAria } from "@/lib/secretary.functions";
import { formatBRL } from "@/hooks/use-finance";
import type { FinanceState } from "@/lib/finance-types";
import type { RoutineState } from "@/hooks/use-routine";
import { isoDate } from "@/hooks/use-routine";
import { toast } from "sonner";

interface Msg { role: "user" | "assistant"; content: string }

function buildContext(finance: FinanceState, routine: RoutineState): string {
  const now = new Date();
  const today = isoDate(now);
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthTx = finance.transactions.filter((t) => new Date(t.date) >= monthStart);
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const totalBalance = finance.accounts.reduce((sum, a) => {
    const tx = finance.transactions.filter((t) => t.accountId === a.id);
    const net = tx.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);
    return sum + a.initialBalance + net;
  }, 0);

  const expenseByCat: Record<string, number> = {};
  for (const t of monthTx.filter((x) => x.type === "expense")) {
    expenseByCat[t.category] = (expenseByCat[t.category] ?? 0) + t.amount;
  }

  const unpaidBills = finance.recurringBills.filter((b) => b.paidMonth !== monthKey);
  const paidBills = finance.recurringBills.filter((b) => b.paidMonth === monthKey);

  const todayWeekday = now.getDay();
  const tasksToday = routine.tasks.filter((t) => !t.days || t.days.length === 0 || t.days.includes(todayWeekday));
  const doneToday = routine.completions[today] ?? [];

  const lines: string[] = [];
  lines.push(`Data: ${now.toLocaleDateString("pt-BR")}`);
  lines.push("");
  lines.push("## Finanças");
  lines.push(`- Saldo total: ${formatBRL(totalBalance)}`);
  lines.push(`- Receitas do mês: ${formatBRL(income)}`);
  lines.push(`- Despesas do mês: ${formatBRL(expense)}`);
  lines.push(`- Resultado do mês: ${formatBRL(income - expense)}`);
  lines.push(`- Contas cadastradas: ${finance.accounts.length}`);
  finance.accounts.forEach((a) => {
    if (a.type === "credit" && a.creditLimit) {
      const spent = finance.transactions
        .filter((t) => t.accountId === a.id && t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      lines.push(`  • ${a.name} (cartão): limite ${formatBRL(a.creditLimit)}, gasto ${formatBRL(spent)}`);
    }
  });

  if (Object.keys(expenseByCat).length) {
    lines.push("");
    lines.push("### Despesas por categoria (mês)");
    Object.entries(expenseByCat)
      .sort((a, b) => b[1] - a[1])
      .forEach(([c, v]) => lines.push(`- ${c}: ${formatBRL(v)}`));
  }

  lines.push("");
  lines.push("## Contas recorrentes do mês");
  if (!finance.recurringBills.length) lines.push("- (nenhuma cadastrada)");
  else {
    lines.push(`- Pagas: ${paidBills.length} / ${finance.recurringBills.length}`);
    unpaidBills.forEach((b) => lines.push(`  • PENDENTE — ${b.name}: ${formatBRL(b.amount)} (vence dia ${b.dueDay})`));
    paidBills.forEach((b) => lines.push(`  • paga — ${b.name}: ${formatBRL(b.amount)}`));
  }

  if (finance.budgets.length) {
    lines.push("");
    lines.push("## Orçamentos");
    finance.budgets.forEach((b) => {
      const spent = expenseByCat[b.category] ?? 0;
      lines.push(`- ${b.category}: ${formatBRL(spent)} de ${formatBRL(b.limit)}`);
    });
  }

  if (finance.goals.length) {
    lines.push("");
    lines.push("## Metas");
    finance.goals.forEach((g) => lines.push(`- ${g.name}: ${formatBRL(g.saved)} / ${formatBRL(g.target)}`));
  }

  lines.push("");
  lines.push("## Checklist de hoje");
  if (!tasksToday.length) lines.push("- (nenhum hábito para hoje)");
  else {
    tasksToday.forEach((t) => {
      const done = doneToday.includes(t.id);
      lines.push(`- [${done ? "x" : " "}] ${t.icon ?? ""} ${t.name}`);
    });
    lines.push(`Progresso de hoje: ${doneToday.filter((id) => tasksToday.some((t) => t.id === id)).length}/${tasksToday.length}`);
  }

  // Streak (dias consecutivos com pelo menos 1 task feita)
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const k = isoDate(d);
    if ((routine.completions[k] ?? []).length > 0) streak++;
    else if (i > 0) break;
  }
  lines.push(`Sequência atual: ${streak} dia(s)`);

  return lines.join("\n");
}

export function SecretaryPanel({ finance, routine }: { finance: FinanceState; routine: RoutineState }) {
  const ask = useServerFn(askAria);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Bom dia. Sou a **Aria**, sua secretária pessoal. Posso te dar o resumo do dia, lembrar das contas pendentes, comentar seu checklist ou conversar sobre suas finanças. Como posso te ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const context = useMemo(() => buildContext(finance, routine), [finance, routine]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: Msg = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await ask({ data: { messages: next, context } });
      setMessages((m) => [...m, { role: "assistant", content: reply || "(sem resposta)" }]);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao falar com a Aria");
      setMessages((m) => m.slice(0, -1));
      setInput(content);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Me dê um resumo do meu mês",
    "Quais contas eu ainda preciso pagar?",
    "Como está meu checklist hoje?",
    "Onde estou gastando mais?",
  ];

  return (
    <Card className="bg-gradient-card border-border/60 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-premium shadow-gold">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-xl leading-none">Aria</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sua secretária pessoal</p>
        </div>
      </div>

      <div ref={scrollRef} className="h-[480px] space-y-4 overflow-y-auto px-6 py-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/60 border border-border/60"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:my-2">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="inline h-4 w-4 animate-spin" /> Aria está pensando…
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 border-t border-border/60 px-6 py-3">
          {suggestions.map((s) => (
            <Button key={s} variant="outline" size="sm" onClick={() => send(s)} disabled={loading}>
              {s}
            </Button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex gap-2 border-t border-border/60 px-6 py-4"
      >
        <Input
          placeholder="Pergunte algo à Aria…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
