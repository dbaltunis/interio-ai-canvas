import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

// Pulsing highlight ring for interactive elements
export const HighlightRing = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("relative inline-block", className)}>
    <motion.div
      className="absolute -inset-1 rounded-lg bg-primary/20"
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <motion.div
      className="absolute -inset-0.5 rounded-lg border-2 border-primary"
      animate={{
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <div className="relative">{children}</div>
  </div>
);

// Highlighted button with pulsing effect
export const HighlightedButton = ({ 
  children,
  icon: Icon,
  variant = "default",
  size = "default",
  className,
}: { 
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}) => (
  <HighlightRing>
    <Button variant={variant} size={size} className={cn("pointer-events-none", className)}>
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  </HighlightRing>
);

// Highlighted input with typing animation
export const HighlightedInput = ({ 
  value,
  placeholder,
  className,
}: { 
  value?: string;
  placeholder?: string;
  className?: string;
}) => (
  <HighlightRing className={className}>
    <Input 
      value={value} 
      placeholder={placeholder}
      readOnly
      className="pointer-events-none"
    />
  </HighlightRing>
);

// Highlighted card with selection effect
export const HighlightedCard = ({ 
  children,
  className,
}: { 
  children: React.ReactNode;
  className?: string;
}) => (
  <HighlightRing className={className}>
    <Card className="pointer-events-none">
      {children}
    </Card>
  </HighlightRing>
);

// Animated cursor pointer
export const AnimatedCursor = ({ 
  x, 
  y,
  isClicking = false,
}: { 
  x: number; 
  y: number;
  isClicking?: boolean;
}) => (
  <motion.div
    className="absolute pointer-events-none z-50"
    animate={{ 
      x, 
      y,
      scale: isClicking ? 0.9 : 1,
    }}
    transition={{ 
      type: "spring", 
      damping: 20, 
      stiffness: 300 
    }}
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="drop-shadow-lg"
    >
      <path
        d="M5 3L19 12L12 13L9 20L5 3Z"
        fill="hsl(var(--foreground))"
        stroke="hsl(var(--background))"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
    {isClicking && (
      <motion.div
        className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary/30"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
    )}
  </motion.div>
);

// Mock table row for list demonstrations
export const MockTableRow = ({ 
  name, 
  value, 
  highlighted = false,
}: { 
  name: string;
  value: string;
  highlighted?: boolean;
}) => (
  <div className={cn(
    "flex items-center justify-between py-2.5 px-3 rounded-md transition-colors",
    highlighted ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
  )}>
    <span className="text-sm font-medium">{name}</span>
    <span className="text-sm text-muted-foreground">{value}</span>
  </div>
);

// Section header for mock UIs
export const MockHeader = ({ 
  title,
  action,
}: { 
  title: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    {action}
  </div>
);

// Typing text animation
export const TypingText = ({ 
  text, 
  className 
}: { 
  text: string;
  className?: string;
}) => {
  return (
    <motion.span 
      className={cn("inline-block", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          {char}
        </motion.span>
      ))}
      <motion.span
        className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
    </motion.span>
  );
};
