import { useState, useEffect, forwardRef } from "react";
import { StickyNote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const NOTES_KEY = "vde_notes";

export const NotesArea = forwardRef<HTMLDivElement>((_, ref) => {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const savedNotes = localStorage.getItem(NOTES_KEY);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  const handleChange = (value: string) => {
    setNotes(value);
    localStorage.setItem(NOTES_KEY, value);
  };

  return (
    <div ref={ref} className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
        <StickyNote className="h-4 w-4" />
        Anotações Rápidas
      </div>
      <Textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Suas anotações..."
        className="bg-background border-border focus:border-primary transition-colors min-h-[150px] resize-none"
      />
    </div>
  );
});

NotesArea.displayName = "NotesArea";
