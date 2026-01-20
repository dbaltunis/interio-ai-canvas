import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/constants/version";
import { TutorialCarousel } from "@/components/help/TutorialCarousel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  OverviewStep1, OverviewStep2, OverviewStep3, OverviewStep4,
  OverviewStep5, OverviewStep6, OverviewStep7, OverviewStep8,
  OverviewStep9, OverviewStep10, OverviewStep11, OverviewStep12,
} from "@/components/help/tutorial-steps/PlatformOverviewSteps";
import type { TutorialStep } from "@/config/tutorialSteps";

interface StepGroup {
  id: string;
  label: string;
  stepRange: [number, number];
}

const STORAGE_KEY = "showcase_last_seen_version";

// Platform overview tutorial steps
const platformOverviewSteps: TutorialStep[] = [
  {
    title: "Your Dashboard",
    actionLabel: "Overview",
    description: "Quick access to everything that matters",
    Visual: OverviewStep1,
    duration: 5000,
  },
  {
    title: "Projects Hub",
    actionLabel: "Jobs",
    description: "Manage all your jobs in one place",
    Visual: OverviewStep2,
    duration: 5000,
  },
  {
    title: "Room Management",
    actionLabel: "Rooms",
    description: "Organize windows by room",
    Visual: OverviewStep3,
    duration: 5000,
  },
  {
    title: "Treatment Types",
    actionLabel: "Treatments",
    description: "Choose from curtains, blinds, and more",
    Visual: OverviewStep4,
    duration: 5000,
  },
  {
    title: "Visual Measurements",
    actionLabel: "Measure",
    description: "Intuitive measurement entry",
    Visual: OverviewStep5,
    duration: 5000,
  },
  {
    title: "Professional Quotes",
    actionLabel: "Quotes",
    description: "Generate and send quotes instantly",
    Visual: OverviewStep6,
    duration: 5000,
  },
  {
    title: "Client CRM",
    actionLabel: "Clients",
    description: "Track leads through your pipeline",
    Visual: OverviewStep7,
    duration: 5000,
  },
  {
    title: "Email & Messaging",
    actionLabel: "Messages",
    description: "Communicate with clients seamlessly",
    Visual: OverviewStep8,
    duration: 5000,
  },
  {
    title: "Inventory Library",
    actionLabel: "Library",
    description: "Manage fabrics, hardware, and pricing",
    Visual: OverviewStep9,
    duration: 5000,
  },
  {
    title: "Calendar & Scheduling",
    actionLabel: "Calendar",
    description: "Schedule appointments and installations",
    Visual: OverviewStep10,
    duration: 5000,
  },
  {
    title: "Settings & Customization",
    actionLabel: "Settings",
    description: "Configure your business preferences",
    Visual: OverviewStep11,
    duration: 5000,
  },
  {
    title: "Your Complete Solution",
    actionLabel: "Summary",
    description: "Everything you need to succeed",
    Visual: OverviewStep12,
    duration: 6000,
  },
];

// Step groups for navigation
const overviewStepGroups: StepGroup[] = [
  { id: "dashboard", label: "Dashboard", stepRange: [0, 0] },
  { id: "jobs", label: "Jobs", stepRange: [1, 5] },
  { id: "crm", label: "CRM", stepRange: [6, 7] },
  { id: "tools", label: "Tools", stepRange: [8, 10] },
  { id: "summary", label: "Summary", stepRange: [11, 11] },
];

export const ShowcaseLightbulb = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewContent, setHasNewContent] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    // Show glow if version changed or never seen
    if (!lastSeen || lastSeen !== APP_VERSION) {
      setHasNewContent(true);
    }
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    // Mark as seen
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    setHasNewContent(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleOpen}
        className={`h-8 w-8 rounded-lg relative transition-all ${
          hasNewContent 
            ? "bg-amber-500/10 hover:bg-amber-500/20" 
            : "hover:bg-muted"
        }`}
        title="Platform Overview"
      >
        {/* Lightbulb icon */}
        <Lightbulb 
          className={`h-4 w-4 transition-colors ${
            hasNewContent 
              ? "text-amber-500 fill-amber-500/30" 
              : "text-muted-foreground"
          }`} 
        />
        
        {/* Glowing pulse animation when new content */}
        <AnimatePresence>
          {hasNewContent && (
            <motion.span
              className="absolute inset-0 rounded-lg bg-amber-500/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </AnimatePresence>
        
        {/* Notification dot */}
        {hasNewContent && (
          <motion.span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          />
        )}
      </Button>

      {/* Platform Overview Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0">
          <SheetHeader className="px-4 py-3 border-b border-border">
            <SheetTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Platform Overview
            </SheetTitle>
          </SheetHeader>
          <div className="p-4 h-[calc(100vh-60px)] overflow-y-auto">
            <TutorialCarousel 
              steps={platformOverviewSteps}
              stepGroups={overviewStepGroups}
              autoPlay
              stepDuration={5000}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
