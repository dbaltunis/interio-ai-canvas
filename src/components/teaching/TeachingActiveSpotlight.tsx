import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeaching } from '@/contexts/TeachingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Global spotlight overlay that highlights target elements during teaching walkthroughs.
 * Shows a dark overlay with a "hole" around the target, pulsing ring animation, and tooltip.
 */
export const TeachingActiveSpotlight = () => {
  // Safe access to context - handle HMR edge cases
  let contextValue;
  try {
    contextValue = useTeaching();
  } catch (e) {
    // Context not available during HMR, return null gracefully
    return null;
  }
  
  const { activeSpotlight, dismissSpotlight, completeTeaching } = contextValue;
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const [isVisible, setIsVisible] = useState(false);

  // Find and track the target element
  const updateTargetPosition = useCallback(() => {
    if (!activeSpotlight?.targetSelector) return;

    const element = document.querySelector(activeSpotlight.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8;
      
      setTargetRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Determine tooltip position based on available space
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      if (rect.bottom + 150 < viewportHeight) {
        setTooltipPosition('bottom');
      } else if (rect.top > 150) {
        setTooltipPosition('top');
      } else if (rect.right + 300 < viewportWidth) {
        setTooltipPosition('right');
      } else {
        setTooltipPosition('left');
      }
    }
  }, [activeSpotlight?.targetSelector]);

  // Initialize spotlight when active
  useEffect(() => {
    if (!activeSpotlight) {
      setIsVisible(false);
      setTargetRect(null);
      return;
    }

    // Wait for page to render, then find element
    const initTimeout = setTimeout(() => {
      updateTargetPosition();
      setIsVisible(true);
    }, 100);

    // Update position on scroll/resize
    const handleUpdate = () => updateTargetPosition();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    // Poll for element if not immediately found
    const pollInterval = setInterval(() => {
      if (!targetRect && activeSpotlight?.targetSelector) {
        updateTargetPosition();
      }
    }, 200);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(pollInterval);
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [activeSpotlight, updateTargetPosition, targetRect]);

  const handleComplete = () => {
    if (activeSpotlight) {
      completeTeaching(activeSpotlight.id);
      dismissSpotlight();
    }
  };

  const handleDismiss = () => {
    dismissSpotlight();
  };

  if (!activeSpotlight || !isVisible) return null;

  const tooltipStyles = () => {
    if (!targetRect) return {};
    
    const tooltipWidth = 280;
    const tooltipOffset = 16;
    
    switch (tooltipPosition) {
      case 'bottom':
        return {
          top: targetRect.top + targetRect.height + tooltipOffset,
          left: Math.max(16, Math.min(
            targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
            window.innerWidth - tooltipWidth - 16
          )),
        };
      case 'top':
        return {
          bottom: window.innerHeight - targetRect.top + tooltipOffset,
          left: Math.max(16, Math.min(
            targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
            window.innerWidth - tooltipWidth - 16
          )),
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2 - 60,
          left: targetRect.left + targetRect.width + tooltipOffset,
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2 - 60,
          right: window.innerWidth - targetRect.left + tooltipOffset,
        };
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        onClick={handleDismiss}
      >
        {/* Dark overlay with SVG mask for spotlight hole */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left}
                  y={targetRect.top}
                  width={targetRect.width}
                  height={targetRect.height}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Pulsing ring around target */}
        {targetRect && (
          <>
            {/* Static border */}
            <div
              className="absolute rounded-lg border-2 border-primary pointer-events-none"
              style={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
              }}
            />
            
            {/* Pulsing ring animation */}
            <motion.div
              className="absolute rounded-lg border-2 border-primary pointer-events-none"
              style={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
              }}
              animate={{
                boxShadow: [
                  '0 0 0 0 hsl(var(--primary) / 0.4)',
                  '0 0 0 12px hsl(var(--primary) / 0)',
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          </>
        )}

        {/* Tooltip with tip content */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, y: tooltipPosition === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute z-10 w-[280px] bg-background rounded-lg shadow-2xl border overflow-hidden"
            style={tooltipStyles()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3 bg-primary/5 border-b flex items-center justify-between">
              <h4 className="font-semibold text-sm">{activeSpotlight.title}</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleDismiss}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="p-3">
              <p className="text-sm text-muted-foreground mb-4">
                {activeSpotlight.description}
              </p>
              
              <Button 
                onClick={handleComplete}
                className="w-full gap-2"
                size="sm"
              >
                <Check className="h-3.5 w-3.5" />
                Got it
              </Button>
            </div>
          </motion.div>
        )}

        {/* Arrow pointer connecting tooltip to target */}
        {targetRect && tooltipPosition === 'bottom' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute w-4 h-4 bg-background border-l border-t rotate-45 -translate-x-1/2"
            style={{
              top: targetRect.top + targetRect.height + 8,
              left: targetRect.left + targetRect.width / 2,
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
