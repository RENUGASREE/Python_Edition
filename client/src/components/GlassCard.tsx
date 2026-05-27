import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Glassmorphism card with subtle entrance animation */
export function GlassCard({ children, className, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl shadow-xl",
        "dark:bg-card/40 dark:border-white/5",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
