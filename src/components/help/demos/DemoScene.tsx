import { motion } from "framer-motion";
import { ReactNode } from "react";

interface DemoSceneProps {
  children: ReactNode;
  className?: string;
}

/**
 * Base container for all demo scenes.
 * Provides a tablet-like frame with consistent styling.
 */
export const DemoScene = ({ children, className = "" }: DemoSceneProps) => {
  return (
    <div className={`relative rounded-lg border bg-background overflow-hidden ${className}`}>
      {/* Tablet frame header */}
      <div className="h-6 bg-muted border-b flex items-center px-3 gap-1.5">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <div className="w-2 h-2 rounded-full bg-yellow-400" />
        <div className="w-2 h-2 rounded-full bg-green-400" />
      </div>
      
      {/* Content area */}
      <div className="p-4 min-h-[200px]">
        {children}
      </div>
    </div>
  );
};

interface AnimatedCursorProps {
  x: number;
  y: number;
  clicking?: boolean;
}

/**
 * Animated cursor that moves to specified positions
 */
export const AnimatedCursor = ({ x, y, clicking = false }: AnimatedCursorProps) => {
  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Cursor pointer */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="drop-shadow-md"
      >
        <path
          d="M5.5 3.21V20.8a1 1 0 0 0 1.62.79l4.56-3.5 2.52 6.27a1 1 0 0 0 1.24.58l2.83-.9a1 1 0 0 0 .58-1.24l-2.52-6.27h5.51a1 1 0 0 0 .71-1.71L6.21 2.5A1 1 0 0 0 5.5 3.21z"
          fill="white"
          stroke="black"
          strokeWidth="1"
        />
      </svg>
      
      {/* Click ripple effect */}
      {clicking && (
        <motion.div
          className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary/30"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.div>
  );
};

interface TypingTextProps {
  text: string;
  className?: string;
}

/**
 * Simulates typing effect for input demonstrations
 */
export const TypingText = ({ text, className = "" }: TypingTextProps) => {
  return (
    <motion.span
      className={className}
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
    </motion.span>
  );
};

interface HighlightBoxProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
}

/**
 * Highlights a UI element during demonstrations
 */
export const HighlightBox = ({ children, active = false, className = "" }: HighlightBoxProps) => {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        boxShadow: active 
          ? "0 0 0 3px hsl(var(--primary) / 0.5)" 
          : "0 0 0 0px transparent"
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
      {active && (
        <motion.div
          className="absolute inset-0 rounded-md border-2 border-primary pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
};
