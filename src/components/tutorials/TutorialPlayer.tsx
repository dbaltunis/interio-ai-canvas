import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/contexts/TutorialContext';
import { TutorialSpotlight, getTargetCenter } from './TutorialSpotlight';
import { TutorialCursor } from './TutorialCursor';
import { TutorialProgressBar } from './TutorialProgress';
import { cn } from '@/lib/utils';

export const TutorialPlayer: React.FC = () => {
  const {
    isPlaying,
    currentTutorial,
    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    isPaused,
    nextStep,
    prevStep,
    stopTutorial,
    pauseTutorial,
    resumeTutorial,
  } = useTutorial();

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Animate cursor to target
  useEffect(() => {
    if (!currentStep || isPaused) return;

    const targetCenter = getTargetCenter(currentStep.targetSelector);
    if (targetCenter) {
      setCursorPosition(targetCenter);
    }

    // Simulate click animation
    if (currentStep.action === 'click') {
      const clickTimer = setTimeout(() => {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 300);
      }, 1500);
      return () => clearTimeout(clickTimer);
    }

    // Simulate typing animation
    if (currentStep.action === 'type') {
      setIsTyping(true);
      const typingTimer = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(typingTimer);
    }
  }, [currentStep, isPaused]);

  // Show completion screen
  useEffect(() => {
    if (!isPlaying && currentTutorial && currentStepIndex === totalSteps - 1) {
      setShowCompletion(true);
      const timer = setTimeout(() => setShowCompletion(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentTutorial, currentStepIndex, totalSteps]);

  // Keyboard navigation
  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          nextStep();
          break;
        case 'ArrowLeft':
          prevStep();
          break;
        case 'Escape':
          stopTutorial();
          break;
        case ' ':
          e.preventDefault();
          isPaused ? resumeTutorial() : pauseTutorial();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, nextStep, prevStep, stopTutorial, pauseTutorial, resumeTutorial]);

  if (!isPlaying || !currentStep) return null;

  const content = (
    <AnimatePresence>
      {/* Spotlight overlay */}
      <TutorialSpotlight
        targetSelector={currentStep.targetSelector}
        animationType={currentStep.animationType}
        isActive={true}
      />

      {/* Animated cursor */}
      <TutorialCursor
        x={cursorPosition.x}
        y={cursorPosition.y}
        isClicking={isClicking}
        isTyping={isTyping}
      />

      {/* Instruction panel */}
      <motion.div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10003] w-full max-w-lg px-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <TutorialProgressBar progress={progress} />

          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {currentTutorial?.title}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={stopTutorial}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {currentStep.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStep.description}
              </p>
            </motion.div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => isPaused ? resumeTutorial() : pauseTutorial()}
                >
                  {isPaused ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <Button
                size="sm"
                onClick={nextStep}
                className="gap-1"
              >
                {currentStepIndex === totalSteps - 1 ? (
                  <>
                    Finish
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Keyboard hints */}
        <div className="flex justify-center gap-4 mt-3 text-xs text-white/60">
          <span>← → Navigate</span>
          <span>Space Pause</span>
          <span>Esc Exit</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

// Completion celebration overlay
export const TutorialCompletionOverlay: React.FC<{
  tutorialTitle: string;
  onClose: () => void;
}> = ({ tutorialTitle, onClose }) => {
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[10010] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-center p-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          <Sparkles className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Tutorial Complete! 🎉
        </h2>
        <p className="text-muted-foreground mb-6">
          You've finished "{tutorialTitle}"
        </p>
        <Button onClick={onClose}>
          Continue
        </Button>
      </motion.div>
    </motion.div>,
    document.body
  );
};
