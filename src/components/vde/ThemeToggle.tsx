import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-9 rounded-xl transition-all duration-300",
        "bg-secondary/50 hover:bg-secondary border border-border/50",
        "group overflow-hidden"
      )}
      aria-label="Alternar tema"
    >
      <Sun className={cn(
        "h-4 w-4 absolute transition-all duration-500",
        theme === "light" 
          ? "rotate-0 scale-100 opacity-100" 
          : "rotate-90 scale-0 opacity-0"
      )} />
      <Moon className={cn(
        "h-4 w-4 absolute transition-all duration-500",
        theme === "dark" 
          ? "rotate-0 scale-100 opacity-100" 
          : "-rotate-90 scale-0 opacity-0"
      )} />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
