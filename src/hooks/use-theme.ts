import { useEffect, useState, useCallback } from "react";

export type Theme = "midnight" | "arctic" | "silver";
const KEY = "fontenele-theme";

const THEME_CLASSES: Record<Theme, string[]> = {
  midnight: ["dark", "theme-midnight"],
  arctic: ["light", "theme-arctic"],
  silver: ["theme-silver", "dark"],
};

function apply(t: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "light", "theme-midnight", "theme-arctic", "theme-silver");
  THEME_CLASSES[t].forEach((c) => root.classList.add(c));
  root.style.colorScheme = t === "arctic" ? "light" : "dark";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("midnight");

  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem(KEY)) as Theme | null;
    const initial: Theme = stored === "midnight" || stored === "arctic" || stored === "silver" ? stored : "midnight";
    setThemeState(initial);
    apply(initial);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    apply(t);
    try { localStorage.setItem(KEY, t); } catch {}
  }, []);

  const cycle = useCallback(() => {
    const order: Theme[] = ["midnight", "arctic", "silver"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  }, [theme, setTheme]);

  return { theme, setTheme, cycle, isDark: theme !== "arctic" };
}
