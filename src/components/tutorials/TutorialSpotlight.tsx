import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialSpotlightProps {
  targetSelector: string;
  animationType: 'pulse' | 'spotlight' | 'zoom' | 'arrow';
  isActive: boolean;
  padding?: number;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const TutorialSpotlight: React.FC<TutorialSpotlightProps> = ({
  targetSelector,
  animationType,
  isActive,
  padding = 8,
}) => {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    if (!isActive || !targetSelector) return;

    const updatePosition = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    
    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    // Poll for element (in case it appears after initial render)
    const pollInterval = setInterval(updatePosition, 500);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      clearInterval(pollInterval);
    };
  }, [targetSelector, isActive, padding]);

  if (!isActive || !targetRect) return null;

  return (
    <AnimatePresence>
      {/* Dark overlay with spotlight hole */}
      <motion.div
        className="fixed inset-0 z-[9999] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <svg className="w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <motion.rect
                initial={{
                  x: targetRect.left,
                  y: targetRect.top,
                  width: targetRect.width,
                  height: targetRect.height,
                  rx: 8,
                }}
                animate={{
                  x: targetRect.left,
                  y: targetRect.top,
                  width: targetRect.width,
                  height: targetRect.height,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </motion.div>

      {/* Highlight border around target */}
      <motion.div
        className="fixed z-[10000] pointer-events-none rounded-lg"
        initial={{
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
          opacity: 0,
        }}
        animate={{
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
          opacity: 1,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        style={{
          boxShadow: animationType === 'zoom' 
            ? '0 0 0 4px hsl(var(--primary)), 0 0 40px 8px hsl(var(--primary) / 0.4)'
            : '0 0 0 3px hsl(var(--primary) / 0.8), 0 0 20px 4px hsl(var(--primary) / 0.3)',
        }}
      >
        {/* Pulse animation */}
        {animationType === 'pulse' && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-primary"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 0.4, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Zoom effect rings */}
        {animationType === 'zoom' && (
          <>
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-primary/50"
              animate={{
                scale: [1, 1.1],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-primary/30"
              animate={{
                scale: [1, 1.2],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.3,
              }}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export const getTargetCenter = (selector: string): { x: number; y: number } | null => {
  const element = document.querySelector(selector);
  if (!element) return null;
  
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};
