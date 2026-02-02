import { cn } from "@/lib/utils";

interface TabNavigationProps {
  activeTab: "overview" | "subjects";
  onTabChange: (tab: "overview" | "subjects") => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-2 px-6 py-3">
      <button
        onClick={() => onTabChange("overview")}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          activeTab === "overview"
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
      >
        Visão Geral
      </button>
      <button
        onClick={() => onTabChange("subjects")}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          activeTab === "subjects"
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
      >
        Matérias
      </button>
    </div>
  );
}
