import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for the element to highlight
  placement?: "top" | "bottom" | "left" | "right";
  action?: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Your Window Covering Business Platform! 🎉",
    description: "Let's take a quick tour to help you get started. This will only take 2 minutes.",
  },
  {
    id: "projects",
    title: "Your Projects Dashboard",
    description: "This is where you'll manage all your jobs. You can see project status, client info, and totals at a glance.",
    target: "[data-tour='projects-tab']",
    placement: "bottom",
    action: () => {}, // Will be set by component
  },
  {
    id: "create-job",
    title: "Create Your First Project",
    description: "Click this button to create a new job. You can add measurements, select products, and generate quotes all in one place.",
    target: "[data-tour='create-job']",
    placement: "left",
  },
  {
    id: "clients",
    title: "Client Relationship Management",
    description: "Switch to the CRM tab to track client information, communication history, and deals all in one centralized location.",
    target: "[data-tour='clients-tab']",
    placement: "bottom",
    action: () => {}, // Will be set by component
  },
  {
    id: "library",
    title: "Product & Component Library",
    description: "The Library tab is where you set up your product templates, pricing grids, and component catalog. This powers all your calculations.",
    target: "[data-tour='library-tab']",
    placement: "bottom",
    action: () => {}, // Will be set by component
  },
  {
    id: "settings",
    title: "Customize Your Settings",
    description: "Click your profile to access Settings where you can configure business details, pricing rules, document templates, and more.",
    target: "[data-tour='settings']",
    placement: "left",
  },
  {
    id: "complete",
    title: "You're All Set! 🚀",
    description: "You're ready to streamline your window covering business. Need help? Check our help center or contact support.",
  },
];

interface WelcomeTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onTabChange?: (tab: string) => void;
}

export const WelcomeTour = ({ isOpen, onComplete, onSkip, onTabChange }: WelcomeTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  // Map step IDs to tab names
  const stepToTab: Record<string, string> = {
    projects: "projects",
    clients: "clients",
    library: "inventory",
  };

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  // Handle tab navigation and element highlighting
  useEffect(() => {
    if (!isOpen) {
      setHighlightedElement(null);
      return;
    }

    // Navigate to the correct tab if needed
    const tabName = stepToTab[step.id];
    if (tabName && onTabChange) {
      onTabChange(tabName);
    }

    // Wait a bit for tab change and DOM update before highlighting
    const timer = setTimeout(() => {
      if (!step.target) {
        setHighlightedElement(null);
        return;
      }

      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, tabName ? 300 : 0); // Delay if we changed tabs

    return () => clearTimeout(timer);
  }, [currentStep, isOpen, step.target, step.id, onTabChange]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay with spotlight effect */}
      <AnimatePresence>
        {highlightedElement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none"
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              maskImage: highlightedElement
                ? `radial-gradient(circle at ${highlightedElement.getBoundingClientRect().left + highlightedElement.offsetWidth / 2}px ${highlightedElement.getBoundingClientRect().top + highlightedElement.offsetHeight / 2}px, transparent 150px, black 200px)`
                : undefined,
            }}
          />
        )}
      </AnimatePresence>

      {/* Tour Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[101]"
        style={
          highlightedElement
            ? {
                top: highlightedElement.getBoundingClientRect().bottom + 20,
                left: highlightedElement.getBoundingClientRect().left,
              }
            : {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }
        }
      >
        <Card className="w-[400px] shadow-2xl border-2 border-primary/20">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <Badge variant="outline" className="bg-primary/10">
                  Step {currentStep + 1} of {tourSteps.length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-6">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
                Skip Tour
              </Button>

              <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                {isLastStep ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};
