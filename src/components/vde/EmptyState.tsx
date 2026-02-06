import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "tasks" | "subjects";
  className?: string;
}

// Animated SVG illustrations
const TasksIllustration = () => (
  <motion.svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    {/* Clipboard body */}
    <motion.rect
      x="25"
      y="20"
      width="70"
      height="85"
      rx="8"
      fill="currentColor"
      className="text-secondary"
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
    />
    
    {/* Clipboard clip */}
    <motion.rect
      x="40"
      y="12"
      width="40"
      height="16"
      rx="4"
      fill="currentColor"
      className="text-primary/30"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    />
    
    {/* Lines */}
    {[0, 1, 2].map((i) => (
      <motion.g key={i}>
        <motion.rect
          x="35"
          y={45 + i * 20}
          width="10"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-muted-foreground/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 + i * 0.1 }}
        />
        <motion.rect
          x="52"
          y={48 + i * 20}
          width={35 - i * 8}
          height="4"
          rx="2"
          fill="currentColor"
          className="text-muted-foreground/20"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
        />
      </motion.g>
    ))}
    
    {/* Sparkle effect */}
    <motion.circle
      cx="85"
      cy="25"
      r="3"
      fill="currentColor"
      className="text-primary"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ delay: 0.8, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
    />
  </motion.svg>
);

const SubjectsIllustration = () => (
  <motion.svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    {/* Book stack */}
    {[0, 1, 2].map((i) => (
      <motion.rect
        key={i}
        x={30 + i * 3}
        y={50 - i * 15}
        width="60"
        height="40"
        rx="4"
        fill="currentColor"
        className={cn(
          i === 0 && "text-primary/40",
          i === 1 && "text-primary/25",
          i === 2 && "text-primary/15"
        )}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 + i * 0.15, type: "spring", stiffness: 150 }}
      />
    ))}
    
    {/* Book spine lines */}
    <motion.rect
      x="35"
      y="55"
      width="2"
      height="30"
      rx="1"
      fill="currentColor"
      className="text-primary/60"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    />
    
    {/* Floating plus sign */}
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.4 }}
    >
      <motion.circle
        cx="85"
        cy="35"
        r="12"
        fill="currentColor"
        className="text-primary/20"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.path
        d="M85 29 L85 41 M79 35 L91 35"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-primary"
      />
    </motion.g>
    
    {/* Sparkles */}
    {[[25, 30], [95, 55], [40, 95]].map(([cx, cy], i) => (
      <motion.circle
        key={i}
        cx={cx}
        cy={cy}
        r="2"
        fill="currentColor"
        className="text-primary/60"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ 
          delay: 1 + i * 0.3, 
          duration: 1.2, 
          repeat: Infinity, 
          repeatDelay: 2.5 
        }}
      />
    ))}
  </motion.svg>
);

export function EmptyState({ type, className }: EmptyStateProps) {
  const config = {
    tasks: {
      illustration: <TasksIllustration />,
      title: "Nenhuma tarefa para hoje",
      description: "Adicione uma matéria para gerar seu cronograma de estudos!",
    },
    subjects: {
      illustration: <SubjectsIllustration />,
      title: "Comece sua jornada",
      description: "Clique em 'Adicionar Matéria' para criar seu primeiro planejamento com IA",
    },
  };

  const { illustration, title, description } = config[type];

  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center py-8 md:py-12 text-center",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-muted-foreground/50 mb-4">
        {illustration}
      </div>
      <motion.h3
        className="text-base md:text-lg font-semibold text-foreground/80 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h3>
      <motion.p
        className="text-xs md:text-sm text-muted-foreground max-w-[250px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}
