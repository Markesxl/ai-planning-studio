import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface DocumentUploaderProps {
  onFileContent: (content: string, fileName: string) => void;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUploader({ onFileContent, isLoading }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selectedFile: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Check file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        throw new Error("Arquivo muito grande. Máximo 10MB.");
      }

      const fileType = selectedFile.type;
      const fileName = selectedFile.name.toLowerCase();

      // Handle text-based files directly
      if (
        fileType.startsWith("text/") ||
        fileName.endsWith(".txt") ||
        fileName.endsWith(".md") ||
        fileName.endsWith(".csv") ||
        fileName.endsWith(".json") ||
        fileName.endsWith(".xml") ||
        fileName.endsWith(".html")
      ) {
        const text = await selectedFile.text();
        setFile(selectedFile);
        onFileContent(text, selectedFile.name);
        return;
      }

      // For PDF, Word, etc., use the edge function
      if (
        fileType === "application/pdf" ||
        fileName.endsWith(".pdf") ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx") ||
        fileType === "application/msword" ||
        fileName.endsWith(".doc") ||
        fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        fileName.endsWith(".pptx")
      ) {
        // Convert file to base64
        const base64 = await fileToBase64(selectedFile);

        const { data, error: fnError } = await supabase.functions.invoke("parse-document", {
          body: {
            file: base64,
            fileName: selectedFile.name,
            fileType: selectedFile.type,
          },
        });

        if (fnError) {
          throw new Error(fnError.message || "Erro ao processar documento");
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        setFile(selectedFile);
        onFileContent(data.content || "", selectedFile.name);
        return;
      }

      throw new Error("Formato de arquivo não suportado.");
    } catch (err) {
      console.error("Error processing file:", err);
      setError(err instanceof Error ? err.message : "Erro ao processar arquivo");
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    onFileContent("", "");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const acceptedTypes = ".txt,.md,.csv,.json,.html,.xml,.pdf,.doc,.docx,.pptx";

  if (file) {
    return (
      <div className="flex items-center gap-3 p-3 bg-secondary/50 border border-primary/30 rounded-lg animate-fade-in">
        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
          onClick={clearFile}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-4 transition-all duration-300 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-secondary/30",
          isProcessing && "opacity-50 pointer-events-none",
          error && "border-destructive/50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing || isLoading}
        />
        <div className="flex flex-col items-center gap-2 text-center">
          {isProcessing ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : (
            <Upload className={cn(
              "h-8 w-8 transition-transform duration-300",
              isDragging ? "text-primary scale-110" : "text-muted-foreground"
            )} />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {isProcessing ? "Processando documento..." : "Arraste um arquivo ou clique"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, Word, TXT, MD, CSV, JSON (máx. 10MB)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive animate-fade-in">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
