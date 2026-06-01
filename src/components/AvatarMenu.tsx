import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Lock, LogOut, Settings, Unlock } from "lucide-react";
import type { Profile } from "@/hooks/use-auth";

const AVATAR_KEY = "fontenele-avatar";

export function useAvatar() {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    try { setSrc(localStorage.getItem(AVATAR_KEY)); } catch {}
  }, []);
  const update = (next: string | null) => {
    setSrc(next);
    try {
      if (next) localStorage.setItem(AVATAR_KEY, next);
      else localStorage.removeItem(AVATAR_KEY);
    } catch {}
  };
  return { src, update };
}

export function AvatarMenu({
  profile, email, onOpenConfig, onLock, hasPin, onSignOut,
}: {
  profile: Profile | null;
  email?: string;
  onOpenConfig: () => void;
  onLock: () => void;
  hasPin: boolean;
  onSignOut: () => void;
}) {
  const { src } = useAvatar();
  const name = profile?.display_name || profile?.username || email?.split("@")[0] || "U";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Menu da conta"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-xs font-medium text-foreground transition hover:border-silver"
        >
          {src ? (
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm">{name}</span>
            {email && <span className="truncate text-[11px] font-normal text-muted-foreground">{email}</span>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onOpenConfig}>
          <Settings className="mr-2 h-4 w-4" /> Configurações
        </DropdownMenuItem>
        {hasPin ? (
          <DropdownMenuItem onClick={onLock}>
            <Lock className="mr-2 h-4 w-4" /> Bloquear app
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onOpenConfig}>
            <Unlock className="mr-2 h-4 w-4" /> Configurar PIN
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="text-loss focus:text-loss">
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
