import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/constants/version";
import { CinematicShowcasePlayer } from "./CinematicShowcasePlayer";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const STORAGE_KEY = "showcase_last_seen_version";

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

  const handleComplete = () => {
    setIsOpen(false);
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
        title="Product Tour"
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

      {/* Showcase Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden bg-background">
          <VisuallyHidden>
            <DialogTitle>Product Tour</DialogTitle>
          </VisuallyHidden>
          <CinematicShowcasePlayer 
            autoPlay 
            onComplete={handleComplete}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
