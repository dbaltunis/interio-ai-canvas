import { useState, useEffect, ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Link2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TutorialStep {
  title: string;
  actionLabel: string;
  description: string;
  Visual: ComponentType;
  relatedSection?: string;
  prerequisiteNote?: string;
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
  stepDuration = 5000,
  onNavigateToSection,
}: TutorialCarouselProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isPlaying, steps.length, stepDuration]);

  const goToStep = (index: number) => {
    setDirection(index > currentStep ? 1 : -1);
    setCurrentStep(index);
  };

  const goNext = () => {
    setDirection(1);
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const step = steps[currentStep];
  const StepVisual = step.Visual;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col bg-muted/30 rounded-xl border border-border overflow-hidden">
      {/* Header with step counter */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </span>
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
      </div>

      {/* Visual area */}
      <div className="relative min-h-[280px] p-4 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            <StepVisual />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action and description area */}
      <div className="px-4 py-4 bg-background border-t border-border space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
            {step.actionLabel}
          </span>
        </div>
        <h4 className="text-base font-semibold text-foreground">
          {step.title}
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>
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
        <div className="flex items-center gap-1.5">
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
  );
};
