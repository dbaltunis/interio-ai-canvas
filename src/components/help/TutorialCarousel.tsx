import { useState, useEffect, useRef, useCallback, ComponentType, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Maximize2, Minimize2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TutorialStep {
  title: string;
  actionLabel: string;
  description: string;
  Visual: ComponentType<{ phase?: number }>;
  relatedSection?: string;
  prerequisiteNote?: string;
  duration?: number;
  group?: string; // Step group for navigation
}

// Step group configuration for grouped navigation
interface StepGroup {
  id: string;
  label: string;
  shortLabel: string;
}

const defaultStepGroups: StepGroup[] = [
  { id: "overview", label: "Dashboard", shortLabel: "Start" },
  { id: "job-details", label: "Job Details", shortLabel: "Details" },
  { id: "project", label: "Rooms & Windows", shortLabel: "Rooms" },
  { id: "inventory", label: "Materials", shortLabel: "Materials" },
  { id: "measurements", label: "Measurements", shortLabel: "Measure" },
  { id: "quote", label: "Quote", shortLabel: "Quote" },
  { id: "workroom", label: "Work Orders", shortLabel: "Orders" },
  { id: "complete", label: "Complete", shortLabel: "Done" },
];

interface TutorialCarouselProps {
  steps: TutorialStep[];
  autoPlay?: boolean;
  stepDuration?: number;
  onNavigateToSection?: (sectionId: string) => void;
  stepGroups?: StepGroup[];
}

// Helper to assign steps to groups based on index
const getStepGroup = (stepIndex: number, totalSteps: number): string => {
  const ratio = stepIndex / totalSteps;
  if (ratio < 0.11) return "overview";
  if (ratio < 0.24) return "job-details";
  if (ratio < 0.46) return "project";
  if (ratio < 0.57) return "inventory";
  if (ratio < 0.65) return "measurements";
  if (ratio < 0.78) return "quote";
  if (ratio < 0.92) return "workroom";
  return "complete";
};

export const TutorialCarousel = ({ 
  steps, 
  autoPlay = true, 
  stepDuration = 6000,
  onNavigateToSection,
  stepGroups = defaultStepGroups,
}: TutorialCarouselProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMaximized, setIsMaximized] = useState(false);
  const [phase, setPhase] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const step = steps[currentStep];
  const currentStepDuration = step.duration || stepDuration;

  // Group steps by their assigned group
  const groupedSteps = useMemo(() => {
    const groups: Record<string, number[]> = {};
    steps.forEach((_, index) => {
      const groupId = getStepGroup(index, steps.length);
      if (!groups[groupId]) groups[groupId] = [];
      groups[groupId].push(index);
    });
    return groups;
  }, [steps]);

  // Get current group info
  const currentGroupId = getStepGroup(currentStep, steps.length);
  const currentGroupSteps = groupedSteps[currentGroupId] || [];
  const stepWithinGroup = currentGroupSteps.indexOf(currentStep);
  const currentGroupIndex = stepGroups.findIndex(g => g.id === currentGroupId);

  // Animation loop
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
      setCurrentStep((prev) => (prev + 1) % steps.length);
      startTimeRef.current = 0;
      setPhase(0);
    }
  }, [currentStepDuration, steps.length]);

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, currentStep, animate]);

  const goToStep = (index: number) => {
    setCurrentStep(index);
    setPhase(0);
    startTimeRef.current = 0;
  };

  const goToGroup = (groupId: string) => {
    const firstStep = groupedSteps[groupId]?.[0];
    if (firstStep !== undefined) goToStep(firstStep);
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

  const slideVariants = {
    enter: { opacity: 0, scale: 0.98 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  };

  return (
    <>
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
        {/* Header - simplified */}
        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {stepGroups.find(g => g.id === currentGroupId)?.label || "Step"} 
              <span className="text-foreground ml-1">{stepWithinGroup + 1}/{currentGroupSteps.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsMaximized(!isMaximized)}>
              {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          </div>
        </div>


        {/* Visual area - taller to prevent scrolling */}
        <div className={cn(
          "relative p-3 overflow-y-auto flex-1",
          isMaximized ? "min-h-[500px] max-h-[600px]" : "min-h-[380px] max-h-[420px]"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="w-full"
            >
              <StepVisual phase={phase} />
            </motion.div>
          </AnimatePresence>
          
          {/* Step progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted/50">
            <motion.div 
              className="h-full bg-primary/60"
              style={{ width: `${phase * 100}%` }}
            />
          </div>
        </div>

        {/* Title */}
        <div className={cn(
          "px-3 py-2 bg-background border-t border-border",
          isMaximized && "py-3"
        )}>
          <h4 className={cn(
            "font-semibold text-foreground text-center",
            isMaximized ? "text-base" : "text-sm"
          )}>
            {step.title}
          </h4>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goPrev} 
            className="h-8 gap-1.5 px-3 text-xs font-medium"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </Button>

          <span className="text-xs text-muted-foreground">
            {currentStep + 1} / {steps.length}
          </span>

          <Button 
            variant="default" 
            size="sm" 
            onClick={goNext} 
            className="h-8 gap-1.5 px-3 text-xs font-medium"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Clickable Step Indicators */}
        <div className="flex items-center justify-center gap-1.5 px-3 py-2 bg-muted/30 border-t border-border">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToStep(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                idx === currentStep
                  ? "bg-primary w-4"
                  : idx < currentStep
                    ? "bg-primary/40"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};
