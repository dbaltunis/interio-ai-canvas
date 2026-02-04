import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/constants/version";
import { WelcomeVideoPlayer } from "@/components/showcase/WelcomeVideoPlayer";
import { welcomeSteps, welcomeChapters } from "./WelcomeVideoAutoTrigger";

const STORAGE_KEY = "showcase_last_seen_version";

interface ShowcaseLightbulbProps {
  size?: "sm" | "md";
}

/**
 * Manual re-watch button for the welcome video.
 * Auto-trigger for first-time users is handled by WelcomeVideoAutoTrigger.
 */
export const ShowcaseLightbulb = ({ size = "md" }: ShowcaseLightbulbProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewContent, setHasNewContent] = useState(false);

  const sizeClasses = size === "sm" 
    ? { button: "h-5 w-5 rounded", icon: "h-3 w-3", dot: "w-1.5 h-1.5" }
    : { button: "h-8 w-8 rounded-lg", icon: "h-4 w-4", dot: "w-2 h-2" };

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    // Show glow if version changed (but not for first-time users - they get auto-trigger)
    if (lastSeen && lastSeen !== APP_VERSION) {
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
        className={`${sizeClasses.button} relative transition-all ${
          hasNewContent 
            ? "bg-amber-500/10 hover:bg-amber-500/20" 
            : "hover:bg-muted"
        }`}
        title="Platform Overview"
      >
        {/* Help icon */}
        <HelpCircle 
          className={`${sizeClasses.icon} transition-colors ${
            hasNewContent 
              ? "text-amber-500 fill-amber-500/30" 
              : "text-muted-foreground"
          }`} 
        />
        
        {/* Glowing pulse animation when new content */}
        <AnimatePresence>
          {hasNewContent && (
            <motion.span
              className={`absolute inset-0 ${sizeClasses.button} bg-amber-500/20`}
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
            className={`absolute -top-0.5 -right-0.5 ${sizeClasses.dot} rounded-full bg-amber-500`}
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
