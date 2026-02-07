import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Loader2, LogIn, UserPlus, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { lovable } from "@/integrations/lovable/index";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forceOpen?: boolean; // For auth guard - prevents closing
}

export function AuthModal({ open, onOpenChange, forceOpen = false }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleOpenChange = (newOpen: boolean) => {
    // If forceOpen is true, prevent closing
    if (forceOpen && !newOpen) return;
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erro ao entrar",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Bem-vindo de volta! 👋",
            description: "Login realizado com sucesso.",
          });
          onOpenChange(false);
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast({
            title: "Erro ao criar conta",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Conta criada! 🎉",
            description: "Verifique seu e-mail para confirmar o cadastro.",
          });
          onOpenChange(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + window.location.pathname,
      });

      if (error) {
        toast({
          title: "Erro ao entrar com Google",
          description: error.message,
          variant: "destructive",
        });
      }
      // If successful, will redirect to Google and back
    } catch (err) {
      toast({
        title: "Erro ao entrar com Google",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setEmail("");
    setPassword("");
    setDisplayName("");
  };

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
              {mode === "login" ? (
                <LogIn className="h-5 w-5 text-primary" />
              ) : (
                <UserPlus className="h-5 w-5 text-primary" />
              )}
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.span
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {mode === "login" ? "Entrar" : "Criar Conta"}
              </motion.span>
            </AnimatePresence>
          </DialogTitle>
        </DialogHeader>

        {/* Google Sign In Button */}
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full h-12 rounded-xl border-border/50 hover:bg-secondary/50 gap-3 font-medium"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="h-5 w-5" />
            )}
            Continuar com Google
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
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
          </div>

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
                {mode === "login" ? "Entrando..." : "Criando..."}
              </>
            ) : (
              <>
                {mode === "login" ? (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Entrar
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Criar Conta
                  </>
                )}
              </>
            )}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === "login" ? (
                <>Não tem conta? <span className="font-semibold text-primary">Criar agora</span></>
              ) : (
                <>Já tem conta? <span className="font-semibold text-primary">Entrar</span></>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
