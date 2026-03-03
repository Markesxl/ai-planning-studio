import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Loader2, LogIn, UserPlus, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forceOpen?: boolean;
}

export function AuthModal({ open, onOpenChange, forceOpen = false }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleOpenChange = (newOpen: boolean) => {
    if (forceOpen && !newOpen) return;
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          toast({ title: "Erro", description: error.message, variant: "destructive" });
        } else {
          toast({
            title: "E-mail enviado! 📧",
            description: "Verifique sua caixa de entrada para redefinir a senha.",
          });
          setMode("login");
        }
      } else if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Bem-vindo de volta! 👋", description: "Login realizado com sucesso." });
          onOpenChange(false);
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Conta criada! 🎉", description: "Verifique seu e-mail para confirmar o cadastro." });
          onOpenChange(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: "login" | "signup" | "forgot") => {
    setMode(newMode);
    setEmail("");
    setPassword("");
    setDisplayName("");
  };

  const modeIcon = mode === "forgot" ? KeyRound : mode === "login" ? LogIn : UserPlus;
  const modeTitle = mode === "forgot" ? "Recuperar Senha" : mode === "login" ? "Entrar" : "Criar Conta";
  const ModeIcon = modeIcon;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-[420px] glass-card border-border/50 rounded-2xl md:rounded-3xl overflow-hidden"
        onPointerDownOutside={(e) => forceOpen && e.preventDefault()}
        onEscapeKeyDown={(e) => forceOpen && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <motion.div
              className="p-2 rounded-xl bg-primary/10 border border-primary/20"
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <ModeIcon className="h-5 w-5 text-primary" />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.span
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {modeTitle}
              </motion.span>
            </AnimatePresence>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <User className="h-4 w-4 text-primary/70" />
                  Nome
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome"
                  className="glass-subtle border-border/50 rounded-xl h-11 focus:border-primary/50"
                  disabled={loading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Mail className="h-4 w-4 text-primary/70" />
              E-mail
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="glass-subtle border-border/50 rounded-xl h-11 focus:border-primary/50"
              disabled={loading}
              required
            />
          </div>

          <AnimatePresence mode="wait">
            {mode !== "forgot" && (
              <motion.div
                key="password"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <Lock className="h-4 w-4 text-primary/70" />
                  Senha
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-subtle border-border/50 rounded-xl h-11 focus:border-primary/50"
                  disabled={loading}
                  required
                  minLength={6}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full font-bold uppercase text-sm py-6 rounded-2xl transition-all duration-300",
              loading
                ? "bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%] animate-shimmer"
                : "bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/25"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {mode === "forgot" ? "Enviando..." : mode === "login" ? "Entrando..." : "Criando..."}
              </>
            ) : (
              <>
                <ModeIcon className="h-5 w-5 mr-2" />
                {mode === "forgot" ? "Enviar Link" : mode === "login" ? "Entrar" : "Criar Conta"}
              </>
            )}
          </Button>

          <div className="text-center pt-2 space-y-1">
            {mode === "forgot" ? (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ← Voltar para o login
              </button>
            ) : mode === "login" ? (
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Não tem conta? <span className="font-semibold text-primary">Criar agora</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Já tem conta? <span className="font-semibold text-primary">Entrar</span>
              </button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
