import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Flame, Trash2, Check, Trophy, Zap, Sparkles, Loader2 } from "lucide-react";
import { listRoutines, createRoutine, deleteRoutine, toggleCompletion, unlockAchievement } from "@/lib/routine.functions";
import { toast } from "sonner";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const WEEKDAYS_FULL = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const CATEGORIES = [
  { v: "saude", l: "Saúde", c: "🏋️" },
  { v: "estudo", l: "Estudo", c: "📚" },
  { v: "espiritual", l: "Espiritual", c: "🙏" },
  { v: "trabalho", l: "Trabalho", c: "💼" },
  { v: "lazer", l: "Lazer", c: "🎯" },
  { v: "outro", l: "Outro", c: "✦" },
];

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dueOn(days: number[], date: Date) {
  return !days || days.length === 0 || days.includes(date.getDay());
}

function computeStreak(days: number[], graceDays: number, completedISO: Set<string>) {
  let streak = 0;
  let misses = 0;
  const t = new Date();
  // not due today => start from yesterday
  if (!dueOn(days, t)) t.setDate(t.getDate() - 1);
  while (true) {
    if (!dueOn(days, t)) {
      t.setDate(t.getDate() - 1);
      continue;
    }
    if (completedISO.has(isoDate(t))) {
      streak++;
    } else {
      misses++;
      if (misses > graceDays) break;
    }
    t.setDate(t.getDate() - 1);
    if (streak > 500) break;
  }
  return streak;
}

export function RoutinePanel() {
  const qc = useQueryClient();
  const list = useServerFn(listRoutines);
  const create = useServerFn(createRoutine);
  const del = useServerFn(deleteRoutine);
  const toggle = useServerFn(toggleCompletion);
  const unlock = useServerFn(unlockAchievement);

  const { data, isLoading } = useQuery({ queryKey: ["routines"], queryFn: () => list() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["routines"] });

  const createMut = useMutation({ mutationFn: (input: any) => create({ data: input }), onSuccess: () => { invalidate(); toast.success("Hábito criado"); } });
  const delMut = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: invalidate });
  const toggleMut = useMutation({
    mutationFn: (input: { routine_id: string; date: string }) => toggle({ data: input }),
    onSuccess: async (res: any) => {
      invalidate();
      if (res?.completed) {
        toast.success(`+10 XP`, { description: `Nível ${res.level}` });
      }
    },
  });

  const todayISO = isoDate(new Date());
  const completedByRoutine = useMemo(() => {
    const map = new Map<string, Set<string>>();
    (data?.completions ?? []).forEach((c: any) => {
      if (!map.has(c.routine_id)) map.set(c.routine_id, new Set());
      map.get(c.routine_id)!.add(c.date);
    });
    return map;
  }, [data]);

  const routinesWithMeta = useMemo(() => {
    return (data?.routines ?? []).map((r: any) => {
      const completed = completedByRoutine.get(r.id) ?? new Set();
      const streak = computeStreak(r.days, r.grace_days, completed);
      const doneToday = completed.has(todayISO);
      const dueToday = dueOn(r.days, new Date());
      return { ...r, streak, doneToday, dueToday };
    });
  }, [data, completedByRoutine, todayISO]);

  const todayRoutines = routinesWithMeta.filter((r: any) => r.dueToday);
  const completedToday = todayRoutines.filter((r: any) => r.doneToday).length;
  const todayPct = todayRoutines.length ? (completedToday / todayRoutines.length) * 100 : 0;
  const totalStreak = Math.max(0, ...routinesWithMeta.map((r: any) => r.streak));

  const profile = data?.profile;
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xpInLevel = xp % 100;

  // Try unlock achievements when streak thresholds hit (idempotent on server)
  useMemo(() => {
    routinesWithMeta.forEach((r: any) => {
      const milestones = [7, 30, 100];
      milestones.forEach((m) => {
        if (r.streak === m) {
          unlock({ data: { code: `streak_${r.id}_${m}`, title: `${m} dias seguidos`, description: r.name } }).catch(() => {});
        }
      });
    });
  }, [routinesWithMeta]);

  if (isLoading) {
    return <div className="flex h-60 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero progress */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-card p-6">
        <div className="absolute inset-0 bg-gradient-glow opacity-60" />
        <div className="relative grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Hoje</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-4xl">{completedToday}</span>
              <span className="text-sm text-muted-foreground">/ {todayRoutines.length} concluídos</span>
            </div>
            <Progress value={todayPct} className="mt-3 h-1.5" />
          </div>
          <div className="border-t border-border/40 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Sequência</p>
            <div className="mt-2 flex items-center gap-2">
              <Flame className="h-7 w-7 text-orange-400" />
              <span className="font-display text-4xl">{totalStreak}</span>
              <span className="text-sm text-muted-foreground">dias</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Seu melhor hábito atual</p>
          </div>
          <div className="border-t border-border/40 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Nível</p>
            <div className="mt-2 flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-display text-4xl">{level}</span>
              <Badge variant="secondary" className="ml-1 text-[10px]">{xp} XP</Badge>
            </div>
            <Progress value={xpInLevel} className="mt-3 h-1.5" />
            <p className="mt-1 text-[10px] text-muted-foreground">{100 - xpInLevel} XP até o próximo nível</p>
          </div>
        </div>
      </Card>

      {/* Habits list */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl">Hábitos</h2>
          <p className="text-xs text-muted-foreground">Concluir hoje vale +10 XP</p>
        </div>
        <NewRoutineDialog onCreate={(d) => createMut.mutate(d)} />
      </div>

      {routinesWithMeta.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-transparent p-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Nenhum hábito ainda. Crie seu primeiro para começar a sequência.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {routinesWithMeta.map((r: any) => (
            <HabitRow
              key={r.id}
              routine={r}
              onToggle={() => toggleMut.mutate({ routine_id: r.id, date: todayISO })}
              onDelete={() => delMut.mutate(r.id)}
            />
          ))}
        </div>
      )}

      {/* Achievements */}
      {(data?.achievements ?? []).length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-xl">Conquistas</h2>
          <div className="flex flex-wrap gap-2">
            {data!.achievements.slice(0, 12).map((a: any) => (
              <div key={a.id} className="flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-3 py-1.5 text-xs">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-medium">{a.title}</span>
                {a.description && <span className="text-muted-foreground">· {a.description}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HabitRow({ routine, onToggle, onDelete }: { routine: any; onToggle: () => void; onDelete: () => void }) {
  const cat = CATEGORIES.find((c) => c.v === routine.category);
  return (
    <Card className={`group relative overflow-hidden border-border/50 bg-card/60 p-4 transition-all hover:border-primary/40 ${routine.doneToday ? "border-success/40 bg-success/5" : ""}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl transition ${routine.doneToday ? "border-success/40 bg-success/10" : "border-border/50 bg-background/40"}`}>
          {routine.icon || cat?.c || "✦"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={`truncate font-medium ${routine.doneToday ? "line-through text-muted-foreground" : ""}`}>{routine.name}</p>
            {routine.streak > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-orange-400">
                <Flame className="h-2.5 w-2.5" /> {routine.streak}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            {cat && <span>{cat.l}</span>}
            {routine.time_of_day && <><span>·</span><span>{routine.time_of_day}</span></>}
            {routine.days?.length > 0 && routine.days.length < 7 && <><span>·</span><span>{routine.days.map((d: number) => WEEKDAYS_FULL[d]).join(" ")}</span></>}
            {routine.grace_days > 0 && <><span>·</span><span>{routine.grace_days}d folga</span></>}
          </div>
        </div>
        <Button
          size="icon"
          variant={routine.doneToday ? "secondary" : "default"}
          onClick={onToggle}
          disabled={!routine.dueToday}
          className={`h-10 w-10 shrink-0 rounded-full ${routine.doneToday ? "bg-success/20 hover:bg-success/30" : "bg-gradient-premium text-primary-foreground"}`}
        >
          <Check className={`h-4 w-4 transition ${routine.doneToday ? "scale-100" : "scale-90"}`} />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}

function NewRoutineDialog({ onCreate }: { onCreate: (d: any) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [category, setCategory] = useState("saude");
  const [time, setTime] = useState("");
  const [days, setDays] = useState<number[]>([]);
  const [grace, setGrace] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      icon: icon || null,
      category,
      time_of_day: time || null,
      days,
      grace_days: grace,
    });
    setOpen(false);
    setName(""); setIcon(""); setTime(""); setDays([]); setGrace(0);
  };

  const toggleDay = (d: number) => setDays((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-premium text-primary-foreground">
          <Plus className="mr-1 h-4 w-4" /> Novo hábito
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border/60">
        <DialogHeader><DialogTitle className="font-display">Novo hábito</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input placeholder="Ex: Academia" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Ícone (emoji)</Label>
              <Input placeholder="💪" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={4} />
            </div>
            <div className="space-y-1.5">
              <Label>Horário</Label>
              <Input placeholder="07:00" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button key={c.v} type="button" onClick={() => setCategory(c.v)}
                  className={`rounded-md border px-2.5 py-1 text-xs transition ${category === c.v ? "border-primary bg-primary/10 text-foreground" : "border-border/50 text-muted-foreground"}`}>
                  {c.c} {c.l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Dias da semana (vazio = todos)</Label>
            <div className="flex gap-1">
              {WEEKDAYS.map((w, i) => (
                <button key={i} type="button" onClick={() => toggleDay(i)}
                  className={`h-9 w-9 rounded-md border text-xs font-semibold transition ${days.includes(i) ? "border-primary bg-primary/10 text-foreground" : "border-border/50 text-muted-foreground"}`}>
                  {w}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Dias de folga permitidos por sequência: {grace}</Label>
            <input type="range" min={0} max={3} value={grace} onChange={(e) => setGrace(Number(e.target.value))} className="w-full accent-primary" />
            <p className="text-[11px] text-muted-foreground">{grace === 0 ? "Modo rigoroso: 1 falha quebra a sequência" : `Permite até ${grace} falha(s) sem perder a sequência`}</p>
          </div>
          <Button type="submit" className="w-full bg-gradient-premium text-primary-foreground">Criar hábito</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
