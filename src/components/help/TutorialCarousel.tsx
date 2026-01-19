import { useState, useEffect, useRef, useCallback, ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TutorialStep {
  title: string;
  actionLabel: string;
  description: string;
  Visual: ComponentType<{ phase?: number }>;
  relatedSection?: string;
  prerequisiteNote?: string;
  duration?: number; // Custom duration per step in ms
}

interface TutorialCarouselProps {
  steps: TutorialStep[];
  autoPlay?: boolean;
  stepDuration?: number;
  onNavigateToSection?: (sectionId: string) => void;
}

export const TutorialCarousel = ({ 
  steps, 
  autoPlay = true, 
  stepDuration = 6000,
  onNavigateToSection,
}: TutorialCarouselProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMaximized, setIsMaximized] = useState(false);
  const [phase, setPhase] = useState(0); // 0-1 progress within step
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const step = steps[currentStep];
  const currentStepDuration = step.duration || stepDuration;

  // Animation loop for smooth phase progression
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / currentStepDuration, 1);
    setPhase(progress);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Auto-advance to next step
      setCurrentStep((prev) => (prev + 1) % steps.length);
      startTimeRef.current = 0;
      setPhase(0);
    }
  }, [currentStepDuration, steps.length]);

  // Start/stop animation based on playing state
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentStep, animate]);

  const goToStep = (index: number) => {
    setCurrentStep(index);
    setPhase(0);
    startTimeRef.current = 0;
  };

  const goNext = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
    setPhase(0);
    startTimeRef.current = 0;
  };

  const goPrev = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
    setPhase(0);
    startTimeRef.current = 0;
  };

  const StepVisual = step.Visual;

  // Cross-fade transition variants
  const slideVariants = {
    enter: {
      opacity: 0,
      scale: 0.98,
    },
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 1.02,
    },
  };

  return (
    <>
      {/* Backdrop overlay when maximized */}
      {isMaximized && (
        <div 
          className="fixed inset-0 bg-black/50 z-[99]" 
          onClick={() => setIsMaximized(false)}
        />
      )}
      <div className={cn(
        "flex flex-col rounded-xl border border-border overflow-hidden transition-all duration-300",
        isMaximized 
          ? "fixed inset-4 z-[100] bg-background shadow-2xl" 
          : "bg-muted/30"
      )}>
      {/* Header with step counter */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <span className={cn(
          "font-medium text-muted-foreground",
          isMaximized ? "text-base" : "text-sm"
        )}>
          Step {currentStep + 1} of {steps.length}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Visual area */}
      <div className={cn(
        "relative p-4 overflow-hidden flex-1",
        isMaximized ? "min-h-[500px]" : "min-h-[320px]"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className={cn("w-full", isMaximized && "scale-110 origin-top")}
          >
            <StepVisual phase={phase} />
          </motion.div>
        </AnimatePresence>
        
        {/* Step progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
          <motion.div 
            className="h-full bg-primary/60"
            style={{ width: `${phase * 100}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
      </div>

      {/* Action and description area */}
      <div className={cn(
        "px-4 py-4 bg-background border-t border-border space-y-2",
        isMaximized && "py-6"
      )}>
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-1 rounded bg-primary/10 text-primary font-semibold uppercase tracking-wide",
            isMaximized ? "text-sm" : "text-xs"
          )}>
            {step.actionLabel}
          </span>
        </div>
        <h4 className={cn(
          "font-semibold text-foreground",
          isMaximized ? "text-lg" : "text-base"
        )}>
          {step.title}
        </h4>
        <p className={cn(
          "text-muted-foreground leading-relaxed",
          isMaximized ? "text-base" : "text-sm"
        )}>
          {step.description}
        </p>
        {step.prerequisiteNote && (
          <p className={cn(
            "text-amber-600 dark:text-amber-400 italic",
            isMaximized ? "text-sm" : "text-xs"
          )}>
            ⚠️ {step.prerequisiteNote}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={goPrev}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>

        {/* Step dots */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[200px]">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentStep
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={goNext}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      </div>
    </>
  );
};
