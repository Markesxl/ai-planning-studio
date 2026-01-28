import { useState } from "react";
import { Sparkles, GraduationCap, Lightbulb, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AIPlannerProps {
  onTasksGenerated: (tasks: { text: string; priority: string }[]) => void;
}

export function AIPlanner({ onTasksGenerated }: AIPlannerProps) {
  const [subject, setSubject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!subject.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha a matéria/curso!",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, descreva o que você quer estudar!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-plan", {
        body: { subject, prompt },
      });

      if (error) {
        throw new Error(error.message || "Erro ao gerar planejamento");
      }

      if (data?.tasks && Array.isArray(data.tasks)) {
        onTasksGenerated(data.tasks);
        setSubject("");
        setPrompt("");
        toast({
          title: "Sucesso! 🎉",
          description: `${data.tasks.length} tarefas geradas pela IA`,
        });
      } else {
        throw new Error("Resposta inválida da IA");
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      toast({
        title: "Erro ao gerar planejamento",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Subject Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <GraduationCap className="h-4 w-4" />
          Matéria/Curso
        </label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ex: Matemática, Python, ENEM..."
          className="bg-background border-border focus:border-primary transition-colors"
          disabled={isLoading}
        />
      </div>

      {/* Prompt Textarea */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <Lightbulb className="h-4 w-4" />
          Prompt para IA
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Descreva o que você quer estudar, seus objetivos, prazo disponível...

Ex: Preciso estudar cálculo diferencial em 30 dias, tenho 2 horas por dia, foco em derivadas e integrais.`}
          className="bg-background border-border focus:border-primary transition-colors min-h-[120px] resize-none"
          disabled={isLoading}
        />
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className={cn(
          "w-full font-bold uppercase text-sm py-6 transition-all duration-300",
          isLoading
            ? "bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%] animate-shimmer"
            : "bg-primary hover:bg-primary/90 glow-primary"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Gerando com IA...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            Gerar Planejamento com IA
          </>
        )}
      </Button>
    </div>
  );
}
