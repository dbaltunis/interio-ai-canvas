import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AnimatedDemoStep, DemoStep } from "./AnimatedDemoStep";

interface AnimatedDemoPlayerProps {
  steps: DemoStep[];
  autoPlay?: boolean;
  stepDuration?: number;
}

export const AnimatedDemoPlayer = ({ 
  steps, 
  autoPlay = true,
  stepDuration = 3000 
}: AnimatedDemoPlayerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / (stepDuration / 50));
      });
    }, 50);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          return 0;
        }
        return prev + 1;
      });
      setProgress(0);
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isPlaying, steps.length, stepDuration]);

  const handlePrevious = () => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1));
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0));
    setProgress(0);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(true);
  };

  if (steps.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
        Demo coming soon
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tablet Frame Container */}
      <div className="relative rounded-xl border-4 border-muted bg-background shadow-lg overflow-hidden">
        {/* Screen Bezel */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-muted" />
        
        {/* Screen Content */}
        <div className="pt-6 pb-4 px-2">
          <div className="rounded-lg bg-muted/30 overflow-hidden aspect-[4/3] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <AnimatedDemoStep step={steps[currentStep]} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {/* Home Button */}
        <div className="flex justify-center pb-2">
          <div className="w-8 h-8 rounded-full border-2 border-muted" />
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-xs font-medium text-foreground">
          {steps[currentStep]?.title}
        </span>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-1" />

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleRestart}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Step Description */}
      {steps[currentStep]?.description && (
        <p className="text-xs text-muted-foreground text-center px-2">
          {steps[currentStep].description}
        </p>
      )}
    </div>
  );
};
