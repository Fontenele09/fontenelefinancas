import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, CircleDot } from "lucide-react";

export function ThemeToggle() {
  const { theme, cycle } = useTheme();
  const Icon = theme === "midnight" ? Moon : theme === "arctic" ? Sun : CircleDot;
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`Tema: ${theme}`}
      title={`Tema: ${theme}`}
      className="text-muted-foreground hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
