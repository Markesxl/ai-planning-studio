import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Brain, Sparkles } from "lucide-react";

interface LoadingShimmerProps {
  message?: string;
  className?: string;
}

export function LoadingShimmer({ message = "Analisando conteúdo...", className }: LoadingShimmerProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 glass-card",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Animated brain icon */}
        <div className="relative">
          <motion.div
            className="absolute inset-0 blur-xl bg-primary/30 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="relative p-4 rounded-2xl bg-primary/10 border border-primary/20"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain className="h-8 w-8 text-primary" />
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-[200px] h-1.5 bg-secondary/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        {/* Message */}
        <motion.p
          className="text-sm font-medium text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>

        {/* Analysis steps */}
        <div className="flex flex-col gap-2 text-xs text-muted-foreground/70">
          {["Identificando complexidade...", "Estimando extensão...", "Gerando cronograma..."].map((step, i) => (
            <motion.div
              key={step}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 1, duration: 0.3 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  delay: i * 1,
                  duration: 1.5, 
                  repeat: Infinity 
                }}
              >
                <Sparkles className="h-3 w-3 text-primary/60" />
              </motion.div>
              <span>{step}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
