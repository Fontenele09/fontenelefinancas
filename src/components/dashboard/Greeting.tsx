import { useMemo } from "react";
import { formatBRL } from "@/hooks/use-finance";
import type { Profile } from "@/hooks/use-auth";

export function Greeting({
  profile, user, totalBalance,
}: { profile: Profile | null; user: { email?: string } | null; totalBalance?: number }) {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const name = profile?.display_name || profile?.username || user?.email?.split("@")[0] || "você";

  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="font-display text-2xl sm:text-3xl text-foreground">
        {greeting}, <span className="text-silver">{name}</span>.
      </h1>
      {typeof totalBalance === "number" && (
        <p className="text-sm text-muted-foreground">
          Seu patrimônio hoje é{" "}
          <span className={`font-medium ${totalBalance >= 0 ? "text-foreground" : "text-loss"}`}>
            {formatBRL(totalBalance)}
          </span>
          .
        </p>
      )}
    </div>
  );
}
