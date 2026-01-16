import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

// Pulsing highlight ring for interactive elements
export const HighlightRing = ({ 
  children, 
  className 
}: { 
  children: ReactNode;
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
  variant = "default",
  size = "sm",
  className,
}: { 
  children: ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}) => (
  <HighlightRing>
    <Button variant={variant} size={size} className={cn("pointer-events-none h-7 text-xs", className)}>
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
  children: ReactNode;
  className?: string;
}) => (
  <HighlightRing className={className}>
    <Card className="pointer-events-none">
      {children}
    </Card>
  </HighlightRing>
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
    "flex items-center justify-between py-2 px-2.5 rounded-md transition-colors",
    highlighted ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
  )}>
    <span className="text-xs font-medium">{name}</span>
    <span className="text-xs text-muted-foreground">{value}</span>
  </div>
);

// Section header for mock UIs
export const MockHeader = ({ 
  title,
  action,
}: { 
  title: string;
  action?: ReactNode;
}) => (
  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
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
