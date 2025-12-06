import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeachingSpotlightProps {
  show: boolean;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  label?: string;
  onClick?: () => void;
}

/**
 * Modern animated arrow/spotlight that points to UI elements
 * 2026 style - sleek, minimal, animated
 */
export const TeachingSpotlight = ({
  show,
  targetSelector,
  position = 'right',
  label,
  onClick,
}: TeachingSpotlightProps) => {
  const [coords, setCoords] = React.useState<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    if (!show || !targetSelector) {
      setCoords(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          x: position === 'left' ? rect.left - 16 : position === 'right' ? rect.right + 16 : rect.left + rect.width / 2,
          y: position === 'top' ? rect.top - 16 : position === 'bottom' ? rect.bottom + 16 : rect.top + rect.height / 2,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [show, targetSelector, position]);

  if (!show || !coords) return null;

  const arrowRotation = {
    top: 90,
    bottom: -90,
    left: 0,
    right: 180,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed z-[100] pointer-events-none"
        style={{ left: coords.x, top: coords.y }}
      >
        <motion.div
          className="relative pointer-events-auto cursor-pointer"
          onClick={onClick}
          animate={{
            x: position === 'left' ? [-4, 4, -4] : position === 'right' ? [4, -4, 4] : 0,
            y: position === 'top' ? [-4, 4, -4] : position === 'bottom' ? [4, -4, 4] : 0,
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
          
          {/* Arrow container */}
          <div 
            className={cn(
              "relative flex items-center gap-2 px-3 py-1.5 rounded-full",
              "bg-primary text-primary-foreground shadow-lg",
              "border border-primary-foreground/20"
            )}
            style={{ transform: `rotate(${arrowRotation[position]}deg)` }}
          >
            <ArrowRight className="h-4 w-4" />
            {label && (
              <span className="text-xs font-medium whitespace-nowrap">{label}</span>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Pulsing dot indicator for subtle feature hints
 */
export const TeachingPulse = ({
  show,
  className,
}: {
  show: boolean;
  className?: string;
}) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn("relative", className)}
    >
      {/* Outer pulse */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/40"
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Inner dot */}
      <div className="relative h-2.5 w-2.5 rounded-full bg-primary shadow-lg" />
    </motion.div>
  );
};

/**
 * Sparkle effect for feature discovery
 */
export const TeachingSparkle = ({
  show,
  children,
  className,
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  if (!show) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative inline-block", className)}>
      {children}
      <motion.div
        className="absolute -top-1 -right-1"
        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="h-4 w-4 text-primary" />
      </motion.div>
    </div>
  );
};
