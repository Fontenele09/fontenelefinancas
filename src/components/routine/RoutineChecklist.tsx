import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Trash2, Plus, ListChecks, Flame } from "lucide-react";
import { isoDate, type RoutineTask, type RoutineState } from "@/hooks/use-routine";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function RoutineChecklist({
  state,
  onAddTask,
  onRemoveTask,
  onToggle,
}: {
  state: RoutineState;
  onAddTask: (t: { name: string; icon?: string; days?: number[] }) => void;
  onRemoveTask: (id: string) => void;
  onToggle: (date: string, taskId: string) => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(isoDate(today));

  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const days = useMemo(() => {
    const arr: { date: Date; iso: string }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      arr.push({ date: dt, iso: isoDate(dt) });
    }
    return arr;
  }, [year, month, daysInMonth]);

  const tasksForDay = (date: Date): RoutineTask[] => {
    const dow = date.getDay();
    return state.tasks.filter((t) => !t.days || t.days.length === 0 || t.days.includes(dow));
  };

  const completionForDay = (iso: string, tasks: RoutineTask[]) => {
    const done = state.completions[iso] ?? [];
    const total = tasks.length;
    const completed = tasks.filter((t) => done.includes(t.id)).length;
    return { completed, total, pct: total ? (completed / total) * 100 : 0 };
  };

  const monthStats = useMemo(() => {
    let done = 0, total = 0;
    for (const d of days) {
      const ts = tasksForDay(d.date);
      total += ts.length;
      const completed = (state.completions[d.iso] ?? []).filter((id) => ts.some((t) => t.id === id)).length;
      done += completed;
    }
    return { done, total, pct: total ? (done / total) * 100 : 0 };
  }, [days, state.completions, state.tasks]);

  const streak = useMemo(() => {
    let s = 0;
    const t = new Date();
    while (true) {
      const iso = isoDate(t);
      const ts = tasksForDay(t);
      if (ts.length === 0) break;
      const done = (state.completions[iso] ?? []).filter((id) => ts.some((x) => x.id === id)).length;
      if (done === ts.length) {
        s++;
        t.setDate(t.getDate() - 1);
      } else break;
    }
    return s;
  }, [state.completions, state.tasks]);

  const selected = new Date(selectedDate + "T00:00:00");
  const tasksSelected = tasksForDay(selected);
  const completionsSelected = state.completions[selectedDate] ?? [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddTask({
      name: newName.trim(),
      icon: newIcon.trim() || undefined,
      days: selectedDays.length === 7 ? undefined : selectedDays,
    });
    setNewName(""); setNewIcon(""); setSelectedDays([]);
  };

  const toggleDay = (d: number) =>
    setSelectedDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-card border-border/60 p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Progresso do mês</p>
          <p className="mt-2 font-display text-3xl">{Math.round(monthStats.pct)}%</p>
          <Progress value={monthStats.pct} className="mt-3 h-2" />
          <p className="mt-2 text-xs text-muted-foreground">{monthStats.done} de {monthStats.total} tarefas concluídas</p>
        </Card>
        <Card className="bg-gradient-card border-border/60 p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Sequência atual</p>
          <div className="mt-2 flex items-baseline gap-2">
            <Flame className="h-6 w-6 text-accent" />
            <p className="font-display text-3xl">{streak}</p>
            <span className="text-sm text-muted-foreground">dias</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Dias consecutivos com 100% da rotina</p>
        </Card>
        <Card className="bg-gradient-card border-border/60 p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Hábitos ativos</p>
          <p className="mt-2 font-display text-3xl">{state.tasks.length}</p>
          <p className="mt-3 text-xs text-muted-foreground">Adicione novos abaixo</p>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="bg-gradient-card border-border/60 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-accent" />
            <h3 className="font-display text-xl">{MONTHS[month]} de {year}</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { const n = new Date(); setCursor(new Date(n.getFullYear(), n.getMonth(), 1)); setSelectedDate(isoDate(n)); }}>
              Hoje
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
          {WEEKDAYS.map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstWeekday }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(({ date, iso }) => {
            const ts = tasksForDay(date);
            const { completed, total, pct } = completionForDay(iso, ts);
            const isToday = iso === isoDate(today);
            const isSelected = iso === selectedDate;
            const fullDone = total > 0 && completed === total;
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className={`group relative aspect-square rounded-lg border p-1.5 text-left transition-all ${
                  isSelected
                    ? "border-accent bg-accent/10 shadow-gold"
                    : "border-border/50 bg-background/40 hover:border-accent/40"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-sm font-medium ${isToday ? "text-accent" : "text-foreground"}`}>
                    {date.getDate()}
                  </span>
                  {fullDone && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
                </div>
                {total > 0 && (
                  <div className="absolute inset-x-1.5 bottom-1.5">
                    <div className="h-1 overflow-hidden rounded-full bg-border/60">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Day detail + add task */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-gradient-card border-border/60 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {WEEKDAYS[selected.getDay()]} · {selected.getDate()} de {MONTHS[selected.getMonth()]}
              </p>
              <h3 className="mt-1 font-display text-xl">Rotina do dia</h3>
            </div>
            <Badge variant="secondary" className="text-xs">
              {tasksSelected.filter((t) => completionsSelected.includes(t.id)).length}/{tasksSelected.length}
            </Badge>
          </div>

          <div className="mt-5 space-y-2">
            {tasksSelected.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma tarefa para este dia. Adicione hábitos ao lado — sem dias específicos eles aparecem todos os dias.
              </p>
            )}
            {tasksSelected.map((t) => {
              const done = completionsSelected.includes(t.id);
              return (
                <div
                  key={t.id}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition ${
                    done ? "border-success/30 bg-success/5" : "border-border/50 bg-background/40"
                  }`}
                >
                  <Checkbox
                    checked={done}
                    onCheckedChange={() => onToggle(selectedDate, t.id)}
                    className="border-accent data-[state=checked]:bg-accent data-[state=checked]:text-primary-foreground"
                  />
                  <span className="text-lg leading-none">{t.icon || "✦"}</span>
                  <p className={`flex-1 font-medium ${done ? "line-through text-muted-foreground" : ""}`}>
                    {t.name}
                  </p>
                  {t.days && t.days.length > 0 && t.days.length < 7 && (
                    <div className="hidden gap-1 sm:flex">
                      {t.days.map((d) => (
                        <span key={d} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {WEEKDAYS[d]}
                        </span>
                      ))}
                    </div>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemoveTask(t.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="bg-gradient-card border-border/60 p-6">
          <h3 className="font-display text-lg">Novo hábito</h3>
          <p className="mt-1 text-xs text-muted-foreground">Ex: Academia, Creatina, Leitura, Água</p>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <Input placeholder="Nome do hábito" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="Emoji (opcional, ex: 💪)" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} maxLength={2} />
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Dias da semana (vazio = todos os dias)</p>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`rounded-md border px-2.5 py-1 text-xs transition ${
                      selectedDays.includes(i)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border/50 text-muted-foreground hover:border-accent/40"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" variant="secondary">
              <Plus className="mr-1 h-4 w-4" /> Adicionar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
