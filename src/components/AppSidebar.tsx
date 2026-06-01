import { Sparkles, Wallet, BarChart3, ListChecks, Crown, Settings } from "lucide-react";

export type SectionId = "financas" | "relatorios" | "rotina" | "kamilly" | "config";

const items: { id: SectionId; icon: any; label: string }[] = [
  { id: "financas", icon: Wallet, label: "Finanças" },
  { id: "relatorios", icon: BarChart3, label: "Relatórios" },
  { id: "rotina", icon: ListChecks, label: "Rotina" },
  { id: "kamilly", icon: Crown, label: "Kamilly" },
  { id: "config", icon: Settings, label: "Configurações" },
];

export function AppSidebar({ active, onChange }: { active: SectionId; onChange: (s: SectionId) => void }) {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-16 flex-col items-center border-r border-border bg-surface py-4 md:flex">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-premium">
        <Sparkles className="h-4 w-4 text-primary-foreground" />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              title={it.label}
              aria-label={it.label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                isActive ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {isActive && <span className="absolute left-0 h-5 w-0.5 rounded-r bg-silver" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileTabs({ active, onChange }: { active: SectionId; onChange: (s: SectionId) => void }) {
  return (
    <nav className="sticky top-0 z-30 flex gap-1 border-b border-border bg-background/85 px-3 py-2 backdrop-blur md:hidden">
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            aria-label={it.label}
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              isActive ? "bg-surface-2 text-foreground" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </nav>
  );
}
