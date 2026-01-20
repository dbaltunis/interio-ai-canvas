/**
 * WelcomeVideoPlayer - Full-screen cinematic welcome experience
 * A story-driven 24-step onboarding that walks users through the entire InterioApp platform
 */

import { useState, useEffect, useRef, useCallback, ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, ChevronLeft, ChevronRight, X, Volume2, VolumeX,
  Maximize2, Minimize2, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const stepDuration = step?.duration || 5000;

  // Get chapter info
  const currentChapter = step?.chapter || chapters[0]?.id;
  const chapterIndex = chapters.findIndex(c => c.id === currentChapter);
  const stepsInCurrentChapter = steps.filter(s => s.chapter === currentChapter);
  const stepWithinChapter = stepsInCurrentChapter.indexOf(step) + 1;

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
        case "1": case "2": case "3": case "4": case "5": case "6": case "7":
          const chapterNum = parseInt(e.key) - 1;
          if (chapters[chapterNum]) {
            goToChapter(chapters[chapterNum].id);
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentStep]);

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

  const restart = () => {
    setCurrentStep(0);
    setPhase(0);
    startTimeRef.current = 0;
    setIsPlaying(true);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported
    }
  };

  const StepVisual = step?.Visual;

  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        ref={containerRef}
        className="max-w-5xl w-[95vw] h-[85vh] p-0 flex flex-col overflow-hidden bg-background"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">IA</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold">Welcome to InterioApp</h2>
                <p className="text-[10px] text-muted-foreground">
                  Your complete platform for made-to-measure blinds & curtains
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chapter Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-muted/30 overflow-x-auto">
          {chapters.map((chapter, i) => {
            const isActive = chapter.id === currentChapter;
            const isPast = chapterIndex > i;
            return (
              <button
                key={chapter.id}
                onClick={() => goToChapter(chapter.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : isPast
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {chapter.label}
              </button>
            );
          })}
        </div>

        {/* Visual Area */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-muted/20 to-background">
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="w-full max-w-3xl h-full">
              <AnimatePresence mode="wait">
                {StepVisual && (
                  <motion.div
                    key={currentStep}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="w-full h-full"
                  >
                    <StepVisual phase={phase} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <motion.div 
              className="h-full bg-primary"
              style={{ width: `${((currentStep + phase) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Info */}
        <div className="px-6 py-4 border-t border-border bg-card">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">{step?.title}</h3>
            <p className="text-sm text-muted-foreground">{step?.description}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={goPrev}
                disabled={currentStep === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9"
                onClick={restart}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button 
                variant="default"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="default" 
                size="sm"
                onClick={goNext}
                disabled={currentStep === steps.length - 1}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1 mt-4">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === currentStep 
                    ? "w-6 bg-primary" 
                    : i < currentStep 
                      ? "w-1.5 bg-primary/40" 
                      : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
