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

// ===========================================
// REUSABLE MOCK COMPONENTS FOR TUTORIALS
// ===========================================

// Pulsing highlight wrapper - simpler version
export const PulsingHighlight = ({ 
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
        scale: [1, 1.02, 1],
        opacity: [0.4, 0.7, 0.4],
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

// Mock Card component
export const MockCard = ({ 
  children, 
  className 
}: { 
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn(
    "rounded-lg border border-border bg-card text-card-foreground",
    className
  )}>
    {children}
  </div>
);

// Mock Button component
export const MockButton = ({ 
  children, 
  variant = "default",
  size = "default",
  className 
}: { 
  children: ReactNode;
  variant?: "default" | "primary" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}) => {
  const variantClasses = {
    default: "bg-secondary text-secondary-foreground",
    primary: "bg-primary text-primary-foreground",
    outline: "border border-input bg-background hover:bg-accent",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground",
  };
  
  const sizeClasses = {
    default: "h-9 px-4 py-2 text-sm",
    sm: "h-7 px-3 text-xs",
    lg: "h-10 px-6 text-base",
  };

  return (
    <div className={cn(
      "inline-flex items-center justify-center rounded-md font-medium cursor-pointer",
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
};

// Mock Input component
export const MockInput = ({ 
  children, 
  placeholder,
  className 
}: { 
  children?: ReactNode;
  placeholder?: string;
  className?: string;
}) => (
  <div className={cn(
    "h-8 px-3 py-1 rounded-md border border-input bg-background text-sm flex items-center",
    !children && "text-muted-foreground",
    className
  )}>
    {children || placeholder}
  </div>
);

// Mock Badge component
export const MockBadge = ({ 
  children, 
  variant = "default",
  className 
}: { 
  children: ReactNode;
  variant?: "default" | "primary" | "secondary" | "outline";
  className?: string;
}) => {
  const variantClasses = {
    default: "bg-primary/10 text-primary",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-input bg-transparent",
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
};
