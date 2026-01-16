import React from 'react';
import { motion } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';

interface TutorialCursorProps {
  x: number;
  y: number;
  isClicking?: boolean;
  isTyping?: boolean;
}

export const TutorialCursor: React.FC<TutorialCursorProps> = ({
  x,
  y,
  isClicking = false,
  isTyping = false,
}) => {
  return (
    <motion.div
      className="fixed pointer-events-none z-[10002]"
      initial={{ x: window.innerWidth / 2, y: window.innerHeight / 2, opacity: 0 }}
      animate={{ 
        x: x - 8, 
        y: y - 4, 
        opacity: 1,
        scale: isClicking ? 0.8 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 20,
        opacity: { duration: 0.3 },
      }}
    >
      {/* Cursor icon */}
      <motion.div
        animate={isClicking ? { scale: [1, 0.8, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        <MousePointer2 
          className="w-8 h-8 text-primary drop-shadow-lg" 
          fill="hsl(var(--primary))"
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Click ripple effect */}
      {isClicking && (
        <motion.div
          className="absolute top-1 left-1 w-6 h-6 rounded-full bg-primary/30"
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}

      {/* Typing indicator */}
      {isTyping && (
        <motion.div
          className="absolute -bottom-6 left-4 flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
