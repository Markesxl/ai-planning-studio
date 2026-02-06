import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  index?: number;
  isHovered?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1],
    },
  }),
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  dim: {
    opacity: 0.7,
    transition: {
      duration: 0.2,
    },
  },
};

export function MotionCard({
  children,
  className,
  index = 0,
  isHovered,
  onHoverStart,
  onHoverEnd,
}: MotionCardProps) {
  return (
    <motion.div
      className={cn("relative", className)}
      custom={index}
      initial="hidden"
      animate={isHovered === false ? "dim" : "visible"}
      whileHover="hover"
      variants={cardVariants}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      {children}
    </motion.div>
  );
}

// Container for staggered children animations
interface MotionContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export function MotionContainer({ 
  children, 
  className,
  staggerDelay = 0.1 
}: MotionContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        ...containerVariants,
        visible: {
          ...containerVariants.visible,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Item variant for use inside MotionContainer
export const motionItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1],
    },
  },
};

export function MotionItem({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return (
    <motion.div className={className} variants={motionItemVariants}>
      {children}
    </motion.div>
  );
}
