import { useMemo } from "react";
import type { Profile } from "@/hooks/use-auth";

export function Greeting({ profile, user }: { profile: Profile | null; user: { email?: string } | null }) {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return { text: "Bom dia", emoji: "☀️" };
    if (h < 18) return { text: "Boa tarde", emoji: "🌤️" };
    return { text: "Boa noite", emoji: "🌙" };
  }, []);

  const name = profile?.display_name || profile?.username || user?.email?.split("@")[0] || "você";

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Saudações</p>
      <h1 className="font-display text-3xl leading-tight sm:text-4xl">
        {greeting.text}, <span className="text-gradient-gold">{name}</span> {greeting.emoji}
      </h1>
    </div>
  );
}
