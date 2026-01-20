import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/constants/version";
import { WelcomeVideoPlayer, VideoStep, VideoChapter } from "@/components/showcase/WelcomeVideoPlayer";
import {
  Scene1IntroLogo,
  Scene2Dashboard,
  Scene3ThemeToggle,
  Scene4JobsNotes,
  Scene5ProjectDeepDive,
  Scene6Closing,
} from "@/components/help/tutorial-steps/WelcomeVideoSteps";

const STORAGE_KEY = "showcase_last_seen_version";

// 6 Cinematic chapters for the product showcase
const welcomeChapters: VideoChapter[] = [
  { id: "intro", label: "Welcome", shortLabel: "Intro" },
  { id: "dashboard", label: "Dashboard", shortLabel: "Dashboard" },
  { id: "theme", label: "Customize", shortLabel: "Theme" },
  { id: "jobs", label: "Jobs & Notes", shortLabel: "Jobs" },
  { id: "project", label: "Project Details", shortLabel: "Project" },
  { id: "closing", label: "Get Started", shortLabel: "Ready" },
];

// 6 Story-driven scenes following the real InterioApp workflow
const welcomeSteps: VideoStep[] = [
  // Scene 1: Opening branding with logo and tagline
  { 
    title: "InterioApp", 
    description: "Sell blinds and curtains online and in-store", 
    Visual: Scene1IntroLogo, 
    duration: 5000, 
    chapter: "intro" 
  },
  
  // Scene 2: Dashboard overview with animated stats
  { 
    title: "Your Dashboard", 
    description: "Revenue trends, job status, and Shopify performance at a glance", 
    Visual: Scene2Dashboard, 
    duration: 8000, 
    chapter: "dashboard" 
  },
  
  // Scene 3: Theme toggle demonstration
  { 
    title: "Customize Your View", 
    description: "Switch between dark and light modes with a single click", 
    Visual: Scene3ThemeToggle, 
    duration: 6000, 
    chapter: "theme" 
  },
  
  // Scene 4: Jobs list and team collaboration
  { 
    title: "Team Collaboration", 
    description: "Write notes and @mention team members on any job", 
    Visual: Scene4JobsNotes, 
    duration: 8000, 
    chapter: "jobs" 
  },
  
  // Scene 5: Project deep dive with tabs, payment, work order, installation, share
  { 
    title: "Project Details", 
    description: "Quote, Payment, Work Orders, Installation & Team Sharing", 
    Visual: Scene5ProjectDeepDive, 
    duration: 15000, 
    chapter: "project" 
  },
  
  // Scene 6: Closing branding
  { 
    title: "Get Started", 
    description: "Your complete platform for made-to-measure window treatments", 
    Visual: Scene6Closing, 
    duration: 5000, 
    chapter: "closing" 
  },
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

      {/* Full-screen Welcome Video Dialog */}
      <WelcomeVideoPlayer
        open={isOpen}
        onOpenChange={setIsOpen}
        steps={welcomeSteps}
        chapters={welcomeChapters}
      />
    </>
  );
};
