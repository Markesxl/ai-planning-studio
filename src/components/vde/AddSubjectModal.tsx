import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { DocumentUploader } from "./DocumentUploader";

interface AddSubjectModalProps {
  onTasksGenerated: (
    tasks: { text: string; priority: string; date?: string; category?: string; subject?: string; description?: string }[],
    analysis?: { dificuldade_estimada: number; horas_totais: number }
  ) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function AddSubjectModal({ onTasksGenerated, onLoadingChange }: AddSubjectModalProps) {
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

    setIsLoading(true);
    onLoadingChange?.(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-plan", {
        body: { 
          subject: course,
          topic: subject,
          prompt: prompt || undefined,
          fileContent: fileContent || undefined 
        },
      });

      if (error) {
        throw new Error(error.message || "Erro ao gerar planejamento");
      }

      if (data?.tasks && Array.isArray(data.tasks)) {
        const tasksWithSubject = data.tasks.map((task: any) => ({
          ...task,
          category: course,
          subject: subject,
        }));
        
        onTasksGenerated(tasksWithSubject, data.analysis);
        
        setCourse("");
        setSubject("");
        setPrompt("");
        setFileContent("");
        setFileName("");
        setShowFileUpload(false);
        setOpen(false);
        
        const analysisInfo = data.analysis 
          ? ` (Dificuldade: ${data.analysis.dificuldade_estimada}/5, ~${data.analysis.horas_totais}h)`
          : "";
        
        toast({
          title: "Sucesso! 🎉",
          description: `${data.tasks.length} tarefas geradas para ${course} - ${subject}${analysisInfo}`,
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
      onLoadingChange?.(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            size="sm"
            className={cn(
              "font-semibold text-xs rounded-lg md:rounded-xl",
              "bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90",
              "shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25",
              "transition-all duration-300",
              "h-8 md:h-9 px-3 md:px-4"
            )}
          >
            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
            <span className="hidden sm:inline">Adicionar</span> Matéria
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[500px] glass-card border-border/50 rounded-2xl md:rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <motion.div 
              className="p-2 rounded-xl bg-primary/10 border border-primary/20"
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            Adicionar Matéria com IA
          </DialogTitle>
        </DialogHeader>
        
        <motion.div 
          className="space-y-5 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Course Input */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <GraduationCap className="h-4 w-4 text-primary/70" />
              Matéria/Curso
            </label>
            <Input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Ex: Matemática, Python, ENEM..."
              className="glass-subtle border-border/50 rounded-xl h-11 focus:border-primary/50 focus:ring-primary/20 transition-all"
              disabled={isLoading}
            />
          </motion.div>

          {/* Subject/Topic Input */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <BookOpen className="h-4 w-4 text-primary/70" />
              Assunto
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Derivadas, Loops em Python, Redação..."
              className="glass-subtle border-border/50 rounded-xl h-11 focus:border-primary/50 focus:ring-primary/20 transition-all"
              disabled={isLoading}
            />
          </motion.div>

          {/* Prompt Textarea */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Lightbulb className="h-4 w-4 text-primary/70" />
              Detalhes do Estudo (opcional)
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Descreva detalhes extras, prazos, objetivos...

💡 A IA vai analisar automaticamente a complexidade e criar um cronograma ideal!`}
              className="glass-subtle border-border/50 rounded-xl min-h-[80px] resize-none focus:border-primary/50 focus:ring-primary/20 transition-all"
              disabled={isLoading}
            />
          </motion.div>

          {/* File Upload Toggle */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className={cn(
                "w-full justify-start gap-2 rounded-xl h-10",
                "border-border/50 hover:bg-secondary/50",
                (showFileUpload || fileContent) && "border-primary/50 bg-primary/5 text-primary"
              )}
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
              {fileContent ? `📎 ${fileName}` : "Anexar arquivo (ementa, cronograma...)"}
            </Button>

            <AnimatePresence>
              {showFileUpload && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DocumentUploader
                    onFileContent={handleFileContent}
                    isLoading={isLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className={cn(
                "w-full font-bold uppercase text-sm py-6 rounded-2xl transition-all duration-300",
                isLoading
                  ? "bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%] animate-shimmer"
                  : "bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/25"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analisando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Gerar Planejamento Inteligente
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
