import { useState } from "react";
import { X, BookOpen, Calendar, FileText, Eye, Zap, Bot, Settings, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NewSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTasksGenerated: (tasks: { text: string; priority: string; date?: string; category?: string }[]) => void;
}

type CreationMode = "title" | "full" | "control";

const SUGGESTIONS = [
  "Aprender divisão celular (mitose e meiose) em 10 dias, 1h/dia",
  "Estudar JavaScript moderno em 30 dias, 2h/dia",
  "Preparar para certificação AWS em 60 dias, 3h/dia",
  "Aprender React.js do zero em 21 dias, 1.5h/dia",
  "Domínio completo de Python para data science em 45 dias, 2h/dia",
  "Curso intensivo de machine learning em 90 dias, 2h/dia",
  "Estudar física quântica básica em 15 dias, 1h/dia",
  "Aprender guitarra do iniciante ao intermediário em 60 dias, 30min/dia",
];

const STEPS = [
  { id: 1, icon: BookOpen, label: "Dados" },
  { id: 2, icon: Calendar, label: "Período" },
  { id: 3, icon: FileText, label: "Materiais" },
  { id: 4, icon: Eye, label: "Revisar" },
];

export function NewSubjectModal({ isOpen, onClose, onTasksGenerated }: NewSubjectModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [creationMode, setCreationMode] = useState<CreationMode>("full");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
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
        body: { 
          subject: prompt.split(" ").slice(0, 3).join(" "), 
          prompt: prompt,
        },
      });

      if (error) {
        throw new Error(error.message || "Erro ao gerar planejamento");
      }

      if (data?.tasks && Array.isArray(data.tasks)) {
        onTasksGenerated(data.tasks);
        toast({
          title: "Sucesso! 🎉",
          description: `${data.tasks.length} tarefas geradas pela IA`,
        });
        handleClose();
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

  const handleClose = () => {
    setCurrentStep(1);
    setPrompt("");
    setCreationMode("full");
    onClose();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">Criar Nova Matéria</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Wizard de 4 passos • {currentStep}/4 • Powered by Google AI
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-xs mt-2",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  "h-0.5 w-16 mx-2 mt-[-20px]",
                  currentStep > step.id ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mode Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 text-primary" />
              Selecione o modo de criação:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setCreationMode("title")}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all",
                  creationMode === "title"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <Zap className="h-5 w-5 text-stat-yellow mb-2" />
                <p className="text-xs">IA gera título e descrição</p>
              </button>
              <button
                onClick={() => setCreationMode("full")}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all relative",
                  creationMode === "full"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                {creationMode === "full" && (
                  <div className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
                )}
                <Bot className="h-5 w-5 text-primary mb-2" />
                <p className="text-xs">Plano completo gerado por IA</p>
              </button>
              <button
                onClick={() => setCreationMode("control")}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all",
                  creationMode === "control"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <Settings className="h-5 w-5 text-muted-foreground mb-2" />
                <p className="text-xs">Controle total com sugestões da IA</p>
              </button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 bg-muted-foreground rounded-full" />
              Todos os modos usam IA do Google para gerar conteúdo personalizado
            </p>
          </div>

          {/* AI Info */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-medium">IA do Google</span>
              <span className="text-muted-foreground text-sm">
                - Pesquisa na internet e gera conteúdo personalizado
              </span>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva o que você quer estudar... (ex: Quero aprender divisão celular em 10 dias, 1 hora por dia)"
              className="min-h-[100px] bg-background border-border resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full sm:w-auto bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Pesquisar e Gerar Plano
                </>
              )}
            </Button>
          </div>

          {/* Suggestions */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              Sugestões populares:
            </label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 text-xs bg-secondary/50 border border-border rounded-full hover:border-muted-foreground/30 hover:bg-secondary transition-all"
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || isLoading}
            className="gap-2"
          >
            ← Voltar
          </Button>
          <span className="text-sm text-muted-foreground">
            Passo {currentStep} de 4
          </span>
          <Button
            onClick={() => {
              if (currentStep < 4) {
                setCurrentStep(currentStep + 1);
              } else {
                handleGenerate();
              }
            }}
            disabled={isLoading}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {currentStep === 4 ? "Finalizar" : "Próximo"} →
          </Button>
        </div>
      </div>
    </div>
  );
}
