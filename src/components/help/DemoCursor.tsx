import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2 } from "lucide-react";

interface DemoCursorProps {
  x: number;
  y: number;
  isClicking?: boolean;
  isTyping?: boolean;
  visible?: boolean;
}

export const DemoCursor: React.FC<DemoCursorProps> = ({
  x,
  y,
  isClicking = false,
  isTyping = false,
  visible = true,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute pointer-events-none z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            x: x - 4,
            y: y - 2,
            opacity: 1,
            scale: isClicking ? 0.85 : 1,
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
            opacity: { duration: 0.2 },
          }}
        >
          {/* Main cursor */}
          <motion.div
            animate={isClicking ? { scale: [1, 0.8, 1] } : {}}
            transition={{ duration: 0.15 }}
          >
            <MousePointer2
              className="w-5 h-5 text-primary drop-shadow-md"
              fill="hsl(var(--primary))"
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Click ripple effect */}
          <AnimatePresence>
            {isClicking && (
              <motion.div
                className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-primary/40"
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                className="absolute -bottom-4 left-3 flex gap-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1 h-1 rounded-full bg-primary"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 0.4,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
