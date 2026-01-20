/**
 * WelcomeVideoPlayer - Clean, cinematic welcome experience
 * Minimal UI inspired by interioapp.com - bold headlines with teal accents
 */

import { useState, useEffect, useRef, useCallback, ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Pause, Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export interface VideoStep {
  title: string;
  description: string;
  Visual: ComponentType<{ phase?: number }>;
  duration?: number;
  chapter: string;
}

export interface VideoChapter {
  id: string;
  label: string;
  shortLabel: string;
}

interface WelcomeVideoPlayerProps {
  steps: VideoStep[];
  chapters: VideoChapter[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WelcomeVideoPlayer = ({
  steps,
  chapters,
  open,
  onOpenChange,
}: WelcomeVideoPlayerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const step = steps[currentStep];
  const stepDuration = step?.duration || 5000;

  // Get chapter info
  const currentChapter = step?.chapter || chapters[0]?.id;
  const chapterIndex = chapters.findIndex(c => c.id === currentChapter);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / stepDuration, 1);
    setPhase(progress);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      startTimeRef.current = 0;
      setPhase(0);
    } else {
      setIsPlaying(false);
    }
  }, [stepDuration, currentStep, steps.length]);

  useEffect(() => {
    if (isPlaying && open) {
      startTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, currentStep, animate, open]);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setPhase(0);
      setIsPlaying(true);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case "ArrowLeft":
          goPrev();
          break;
        case "ArrowRight":
          goNext();
          break;
        case " ":
          e.preventDefault();
          setIsPlaying(p => !p);
          break;
        case "Escape":
          onOpenChange(false);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentStep, onOpenChange]);

  const goToStep = (index: number) => {
    setCurrentStep(index);
    setPhase(0);
    startTimeRef.current = 0;
  };

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setPhase(0);
      startTimeRef.current = 0;
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setPhase(0);
      startTimeRef.current = 0;
    }
  };

  const goToChapter = (chapterId: string) => {
    const firstStepIndex = steps.findIndex(s => s.chapter === chapterId);
    if (firstStepIndex !== -1) {
      goToStep(firstStepIndex);
    }
  };

  const StepVisual = step?.Visual;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl w-[92vw] h-[80vh] p-0 flex flex-col overflow-hidden bg-background border-0 shadow-2xl gap-0"
      >
        <VisuallyHidden>
          <DialogTitle>Welcome to InterioApp</DialogTitle>
        </VisuallyHidden>
        
        {/* Close button - single, minimal */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Visual Area - full height, immersive */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-muted/10 to-background">
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-2xl h-full">
              <AnimatePresence mode="wait">
                {StepVisual && (
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="w-full h-full"
                  >
                    <StepVisual phase={phase} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Side Navigation Arrows - minimal */}
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all",
              "bg-background/60 backdrop-blur-sm hover:bg-background/90",
              currentStep === 0 && "opacity-30 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <button
            onClick={goNext}
            disabled={currentStep === steps.length - 1}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all",
              "bg-background/60 backdrop-blur-sm hover:bg-background/90",
              currentStep === steps.length - 1 && "opacity-30 cursor-not-allowed"
            )}
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Bottom Navigation - minimal, clean */}
        <div className="px-6 py-4 border-t border-border/50 bg-background">
          {/* Chapter Navigation - text-only with underline */}
          <div className="flex items-center justify-center gap-6 mb-4 overflow-x-auto">
            {chapters.map((chapter, i) => {
              const isActive = chapter.id === currentChapter;
              const isPast = chapterIndex > i;
              return (
                <button
                  key={chapter.id}
                  onClick={() => goToChapter(chapter.id)}
                  className={cn(
                    "relative text-xs font-medium transition-all whitespace-nowrap pb-1",
                    isActive 
                      ? "text-foreground" 
                      : isPast
                        ? "text-primary/70"
                        : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {chapter.shortLabel}
                  {/* Teal underline for active chapter */}
                  {isActive && (
                    <motion.div
                      layoutId="chapter-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Progress bar + Play/Pause */}
          <div className="flex items-center gap-4">
            {/* Play/Pause - small, subtle */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            >
              {isPlaying 
                ? <Pause className="h-3.5 w-3.5 text-foreground" /> 
                : <Play className="h-3.5 w-3.5 text-foreground ml-0.5" />
              }
            </button>

            {/* Progress bar - thin, full width */}
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${((currentStep + phase) / steps.length) * 100}%` }}
              />
            </div>

            {/* Step counter */}
            <span className="text-xs text-muted-foreground font-medium tabular-nums">
              {currentStep + 1}/{steps.length}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
