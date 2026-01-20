import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/constants/version";
import { WelcomeVideoPlayer, VideoStep, VideoChapter } from "@/components/showcase/WelcomeVideoPlayer";
import {
  WelcomeStep1, WelcomeStep2, WelcomeStep3, WelcomeStep4,
  WelcomeStep5, WelcomeStep6, WelcomeStep7, WelcomeStep8,
  WelcomeStep9, WelcomeStep10, WelcomeStep11, WelcomeStep12,
  WelcomeStep13, WelcomeStep14, WelcomeStep15, WelcomeStep16,
  WelcomeStep17, WelcomeStep18, WelcomeStep19, WelcomeStep20,
  WelcomeStep21, WelcomeStep22, WelcomeStep23, WelcomeStep24,
} from "@/components/help/tutorial-steps/WelcomeVideoSteps";

const STORAGE_KEY = "showcase_last_seen_version";

// 8 Chapters matching real InterioApp workflow
const welcomeChapters: VideoChapter[] = [
  { id: "welcome", label: "Welcome", shortLabel: "Welcome" },
  { id: "setup", label: "Setup", shortLabel: "Setup" },
  { id: "pricing", label: "Pricing", shortLabel: "Pricing" },
  { id: "team", label: "Team", shortLabel: "Team" },
  { id: "shopify", label: "Shopify", shortLabel: "Shopify" },
  { id: "projects", label: "Projects", shortLabel: "Projects" },
  { id: "crm", label: "Clients", shortLabel: "CRM" },
  { id: "campaigns", label: "Campaigns", shortLabel: "Campaigns" },
];

// 24 Story-driven steps following real InterioApp workflow
const welcomeSteps: VideoStep[] = [
  // Chapter 1: Welcome (1 step)
  { title: "Welcome to InterioApp", description: "Your complete platform for made-to-measure blinds & curtains", Visual: WelcomeStep1, duration: 5000, chapter: "welcome" },
  
  // Chapter 2: Setup Your App (3 steps)
  { title: "Choose Your Theme", description: "Switch between dark and light modes anytime", Visual: WelcomeStep2, duration: 5000, chapter: "setup" },
  { title: "Business Profile", description: "Add your company name, logo, and contact details", Visual: WelcomeStep3, duration: 5000, chapter: "setup" },
  { title: "Getting Started", description: "Complete these steps to set up your workspace", Visual: WelcomeStep4, duration: 5000, chapter: "setup" },
  
  // Chapter 3: Pricing & Markups (3 steps)
  { title: "Global Markups", description: "Set your material and labor profit margins", Visual: WelcomeStep5, duration: 5000, chapter: "pricing" },
  { title: "Category Pricing", description: "Different margins for Premium, Standard, and Budget fabrics", Visual: WelcomeStep6, duration: 5000, chapter: "pricing" },
  { title: "Price Preview", description: "See how markups affect your final quotes", Visual: WelcomeStep7, duration: 5000, chapter: "pricing" },
  
  // Chapter 4: Team & Permissions (3 steps)
  { title: "Invite Team Members", description: "Add staff by email with role assignment", Visual: WelcomeStep8, duration: 5000, chapter: "team" },
  { title: "Team Messaging", description: "In-app chat between team members", Visual: WelcomeStep9, duration: 5000, chapter: "team" },
  { title: "Permission Controls", description: "Granular access for Jobs, Quotes, and Clients", Visual: WelcomeStep10, duration: 5000, chapter: "team" },
  
  // Chapter 5: Shopify Integration (4 steps)
  { title: "Connect Shopify", description: "Link your existing Shopify store", Visual: WelcomeStep11, duration: 5000, chapter: "shopify" },
  { title: "Import Fabrics", description: "Pull products from your Shopify catalog", Visual: WelcomeStep12, duration: 5000, chapter: "shopify" },
  { title: "Sync Products", description: "Two-way sync between platforms", Visual: WelcomeStep13, duration: 5000, chapter: "shopify" },
  { title: "Inventory & QR Codes", description: "Track stock levels with QR scanning", Visual: WelcomeStep14, duration: 5000, chapter: "shopify" },
  
  // Chapter 6: Create Projects (5 steps)
  { title: "Create New Project", description: "Start a new job with client details", Visual: WelcomeStep15, duration: 5000, chapter: "projects" },
  { title: "Add Rooms", description: "Use templates like Living Room, Bedroom, Kitchen", Visual: WelcomeStep16, duration: 5000, chapter: "projects" },
  { title: "Window Treatments", description: "Select Blinds, Curtains, or Shutters", Visual: WelcomeStep17, duration: 5000, chapter: "projects" },
  { title: "Visual Measurements", description: "Diagram-based measurement entry", Visual: WelcomeStep18, duration: 5000, chapter: "projects" },
  { title: "Generate Quote", description: "Auto-calculate pricing with your margins", Visual: WelcomeStep19, duration: 5000, chapter: "projects" },
  
  // Chapter 7: Client CRM (3 steps)
  { title: "Client List", description: "View all clients with funnel stages", Visual: WelcomeStep20, duration: 5000, chapter: "crm" },
  { title: "Client Profile", description: "Full history with projects, notes, and communications", Visual: WelcomeStep21, duration: 5000, chapter: "crm" },
  { title: "Sales Pipeline", description: "Kanban board for tracking deals", Visual: WelcomeStep22, duration: 5000, chapter: "crm" },
  
  // Chapter 8: Marketing Campaigns (2 steps)
  { title: "Email Campaigns", description: "Create and schedule campaigns to leads and clients", Visual: WelcomeStep23, duration: 5000, chapter: "campaigns" },
  { title: "You're All Set!", description: "Start creating projects and growing your business", Visual: WelcomeStep24, duration: 6000, chapter: "campaigns" },
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