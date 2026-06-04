import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "default" | "gradient" | "elevated" | "bordered" | "glow";
  hover?: boolean;
}

/** Premium glassmorphism card with variants and hover effects */
export function GlassCard({ children, className, delay = 0, variant = "default", hover = false }: GlassCardProps) {
  const variants = {
    default: "bg-card/70 backdrop-blur-xl border-card-border/70 shadow-xl",
    gradient: "bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-xl border-card-border/50 shadow-xl",
    elevated: "bg-card/90 backdrop-blur-2xl border-card-border/80 shadow-2xl",
    bordered: "bg-card/60 backdrop-blur-lg border-primary/30 shadow-lg",
    glow: "bg-card/70 backdrop-blur-xl border-primary/50 shadow-primary/30 shadow-xl",
  };

  const hoverEffects = hover
    ? "hover:scale-[1.02] hover:shadow-2xl hover:border-primary/40 transition-all duration-300 cursor-pointer"
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { scale: 1.02 } : {}}
      className={cn(
        "rounded-2xl border shadow-black/5 dark:shadow-black/25",
        variants[variant],
        hoverEffects,
        className
      )}
    >
      {children}
    </motion.div>
  );
}
