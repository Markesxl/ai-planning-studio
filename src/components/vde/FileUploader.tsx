import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileContent: (content: string, fileName: string) => void;
  isLoading?: boolean;
}

export function FileUploader({ onFileContent, isLoading }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selectedFile: File) => {
    setIsProcessing(true);
    try {
      const text = await selectedFile.text();
      setFile(selectedFile);
      onFileContent(text, selectedFile.name);
    } catch (error) {
      console.error("Error reading file:", error);
    } finally {
      setIsProcessing(false);
    }
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
    onFileContent("", "");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const acceptedTypes = ".txt,.md,.csv,.json,.html,.xml,.pdf";

  if (file) {
    return (
      <div className="flex items-center gap-3 p-3 bg-secondary/50 border border-primary/30 rounded-lg">
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
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={clearFile}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-4 transition-all duration-300 cursor-pointer",
        isDragging
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50 hover:bg-secondary/30",
        isProcessing && "opacity-50 pointer-events-none"
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
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">
            {isProcessing ? "Processando..." : "Arraste um arquivo ou clique"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            TXT, MD, CSV, JSON, HTML, XML
          </p>
        </div>
      </div>
    </div>
  );
}
