import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (index: number) => void;
}

export const TutorialProgress: React.FC<TutorialProgressProps> = ({
  currentStep,
  totalSteps,
  onStepClick,
}) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            <motion.button
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                isCompleted && 'bg-primary text-primary-foreground',
                isCurrent && 'bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background',
                !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
              )}
              onClick={() => onStepClick?.(index)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              disabled={!onStepClick}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </motion.button>

            {/* Connector line */}
            {index < totalSteps - 1 && (
              <div className="flex-1 h-0.5 min-w-4 max-w-8">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  style={{ originX: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="h-full bg-muted -mt-0.5" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const TutorialProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
};
