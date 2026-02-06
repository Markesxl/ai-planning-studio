import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1.5, 
  suffix = "", 
  className 
}: AnimatedCounterProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) => 
    Math.round(current)
  );

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    } else {
      spring.set(value);
    }
  }, [value, spring, hasAnimated]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => {
      setDisplayValue(v);
    });
    return () => unsubscribe();
  }, [display]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayValue}{suffix}
    </motion.span>
  );
}
