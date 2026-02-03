import { useState } from "react";
import { Plus, GraduationCap, BookOpen, Lightbulb, Loader2, Sparkles, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FileUploader } from "./FileUploader";

interface AddSubjectModalProps {
  onTasksGenerated: (tasks: { text: string; priority: string; date?: string; category?: string; subject?: string; description?: string }[]) => void;
}

export function AddSubjectModal({ onTasksGenerated }: AddSubjectModalProps) {
  const [open, setOpen] = useState(false);
  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleFileContent = (content: string, name: string) => {
    setFileContent(content);
    setFileName(name);
  };

  const handleGenerate = async () => {
    if (!course.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha a matéria/curso!",
        variant: "destructive",
      });
      return;
    }

    if (!subject.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o assunto!",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim() && !fileContent) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, descreva o que você quer estudar ou anexe um arquivo!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const fullPrompt = `Matéria: ${course}\nAssunto: ${subject}\n\nDetalhes: ${prompt || `Baseado no arquivo: ${fileName}`}`;
      
      const { data, error } = await supabase.functions.invoke("generate-plan", {
        body: { 
          subject: course,
          topic: subject,
          prompt: fullPrompt,
          fileContent: fileContent || undefined 
        },
      });

      if (error) {
        throw new Error(error.message || "Erro ao gerar planejamento");
      }

      if (data?.tasks && Array.isArray(data.tasks)) {
        // Add subject to all tasks
        const tasksWithSubject = data.tasks.map((task: any) => ({
          ...task,
          category: course,
          subject: subject,
        }));
        
        onTasksGenerated(tasksWithSubject);
        
        // Reset form
        setCourse("");
        setSubject("");
        setPrompt("");
        setFileContent("");
        setFileName("");
        setShowFileUpload(false);
        setOpen(false);
        
        toast({
          title: "Sucesso! 🎉",
          description: `${data.tasks.length} tarefas geradas para ${course} - ${subject}`,
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full font-bold uppercase text-sm py-6 bg-primary hover:bg-primary/90 glow-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Matéria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Adicionar Matéria com IA
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Course Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <GraduationCap className="h-4 w-4" />
              Matéria/Curso
            </label>
            <Input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Ex: Matemática, Python, ENEM..."
              className="bg-background border-border focus:border-primary transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Subject/Topic Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <BookOpen className="h-4 w-4" />
              Assunto
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Derivadas, Loops em Python, Redação..."
              className="bg-background border-border focus:border-primary transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Prompt Textarea */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Lightbulb className="h-4 w-4" />
              Detalhes do Estudo
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Descreva o que você quer estudar, objetivos, prazo...

Ex: Preciso dominar derivadas em 2 semanas, tenho 1 hora por dia.`}
              className="bg-background border-border focus:border-primary transition-colors min-h-[100px] resize-none"
              disabled={isLoading}
            />
          </div>

          {/* File Upload Toggle */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className={cn(
                "w-full justify-start gap-2 text-muted-foreground hover:text-foreground",
                (showFileUpload || fileContent) && "border-primary text-primary"
              )}
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
              {fileContent ? `📎 ${fileName}` : "Anexar arquivo (ementa, cronograma...)"}
            </Button>

            {showFileUpload && (
              <FileUploader
                onFileContent={handleFileContent}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className={cn(
              "w-full font-bold uppercase text-sm py-6 transition-all duration-300",
              isLoading
                ? "bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%] animate-shimmer"
                : "bg-primary hover:bg-primary/90"
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
                Gerar Planejamento
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
