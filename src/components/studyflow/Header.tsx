import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onNewSubject: () => void;
}

export function Header({ onNewSubject }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50">
      <div>
        <h1 className="text-xl font-bold text-primary">StudyFlow AI</h1>
        <p className="text-xs text-muted-foreground">Gerenciador de Estudos com Google AI</p>
      </div>
      <Button 
        onClick={onNewSubject}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
      >
        <Plus className="h-4 w-4" />
        Nova Matéria
      </Button>
    </header>
  );
}
