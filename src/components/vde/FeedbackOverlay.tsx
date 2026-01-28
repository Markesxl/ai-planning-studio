import { useEffect, useState } from "react";
import { Brain, CheckCircle, AlertTriangle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackType = "loading" | "success" | "error" | "complete";

interface FeedbackOverlayProps {
  show: boolean;
  type: FeedbackType;
  message: string;
  onHide?: () => void;
}

const ICONS = {
  loading: Brain,
  success: CheckCircle,
  error: AlertTriangle,
  complete: Trophy,
};

const COLORS = {
  loading: "text-primary border-primary bg-primary/10",
  success: "text-primary border-primary bg-primary/10",
  error: "text-destructive border-destructive bg-destructive/10",
  complete: "text-yellow-400 border-yellow-400 bg-yellow-400/10",
};

export function FeedbackOverlay({ show, type, message, onHide }: FeedbackOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      if (type !== "loading") {
        const timer = setTimeout(() => {
          setIsVisible(false);
          onHide?.();
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [show, type, onHide]);

  const Icon = ICONS[type];

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm",
        "transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div
        className={cn(
          "glass border rounded-3xl px-12 py-8 text-center",
          "animate-scale-in",
          COLORS[type]
        )}
      >
        <Icon
          className={cn(
            "h-12 w-12 mx-auto mb-4",
            type === "loading" && "animate-pulse"
          )}
        />
        <p className="font-bold text-lg">{message}</p>
      </div>
    </div>
  );
}
