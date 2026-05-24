import { useEffect, useState, useCallback } from "react";

export interface RoutineTask {
  id: string;
  name: string;
  icon?: string; // emoji
  days?: number[]; // 0=Dom .. 6=Sab. vazio = todos os dias
  createdAt: string;
}

export interface RoutineState {
  tasks: RoutineTask[];
  // completions[date(YYYY-MM-DD)] = array of task ids feitos naquele dia
  completions: Record<string, string[]>;
}

const STORAGE_KEY = "routine:v1";

const seed: RoutineState = { tasks: [], completions: {} };

function load(): RoutineState {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    return JSON.parse(raw) as RoutineState;
  } catch {
    return seed;
  }
}

export function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useRoutine() {
  const [state, setState] = useState<RoutineState>(seed);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setState(load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  const addTask = useCallback((t: Omit<RoutineTask, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      tasks: [...s.tasks, { ...t, id: crypto.randomUUID(), createdAt: new Date().toISOString() }],
    }));
  }, []);

  const removeTask = useCallback((id: string) => {
    setState((s) => {
      const completions: Record<string, string[]> = {};
      for (const k of Object.keys(s.completions)) {
        completions[k] = s.completions[k].filter((x) => x !== id);
      }
      return { ...s, tasks: s.tasks.filter((t) => t.id !== id), completions };
    });
  }, []);

  const toggleCompletion = useCallback((date: string, taskId: string) => {
    setState((s) => {
      const current = s.completions[date] ?? [];
      const next = current.includes(taskId)
        ? current.filter((x) => x !== taskId)
        : [...current, taskId];
      return { ...s, completions: { ...s.completions, [date]: next } };
    });
  }, []);

  return { state, loaded, addTask, removeTask, toggleCompletion };
}
