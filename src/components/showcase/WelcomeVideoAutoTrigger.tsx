import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeVideoPlayer, VideoStep, VideoChapter } from "./WelcomeVideoPlayer";
import {
  Scene0Welcome,
  Scene1IntroLogo,
  Scene2Dashboard,
  Scene3ThemeToggle,
  Scene4JobsNotes,
  Scene5ProjectDeepDive,
  Scene6Closing,
  Scene7Calendar,
  Scene8Library,
} from "@/components/help/tutorial-steps/WelcomeVideoSteps";

// Centralized welcome video content (shared with ShowcaseLightbulb)
export const welcomeChapters: VideoChapter[] = [
  { id: "welcome", label: "Welcome", shortLabel: "Hi" },
  { id: "intro", label: "InterioApp", shortLabel: "Intro" },
  { id: "dashboard", label: "Dashboard", shortLabel: "Dashboard" },
  { id: "theme", label: "Customize", shortLabel: "Theme" },
  { id: "jobs", label: "Jobs & Notes", shortLabel: "Jobs" },
  { id: "project", label: "Project Details", shortLabel: "Project" },
  { id: "calendar", label: "Calendar", shortLabel: "Calendar" },
  { id: "library", label: "Library", shortLabel: "Library" },
  { id: "closing", label: "Get Started", shortLabel: "Ready" },
];

export const welcomeSteps: VideoStep[] = [
  { 
    title: "Welcome", 
    description: "We're excited to have you here!", 
    Visual: Scene0Welcome, 
    duration: 4000, 
    chapter: "welcome" 
  },
  { 
    title: "InterioApp", 
    description: "Sell blinds and curtains online and in-store", 
    Visual: Scene1IntroLogo, 
    duration: 5000, 
    chapter: "intro" 
  },
  { 
    title: "Your Dashboard", 
    description: "Revenue trends, job status, and Shopify performance at a glance", 
    Visual: Scene2Dashboard, 
    duration: 8000, 
    chapter: "dashboard" 
  },
  { 
    title: "Customize Your View", 
    description: "Switch between dark and light modes with a single click", 
    Visual: Scene3ThemeToggle, 
    duration: 6000, 
    chapter: "theme" 
  },
  { 
    title: "Team Collaboration", 
    description: "Write notes and @mention team members on any job", 
    Visual: Scene4JobsNotes, 
    duration: 8000, 
    chapter: "jobs" 
  },
  { 
    title: "Project Details", 
    description: "Quote, Payment, Work Orders, Installation & Team Sharing", 
    Visual: Scene5ProjectDeepDive, 
    duration: 18000, 
    chapter: "project" 
  },
  { 
    title: "Calendar & Bookings", 
    description: "Google Calendar sync, booking templates, and client scheduling", 
    Visual: Scene7Calendar, 
    duration: 12000, 
    chapter: "calendar" 
  },
  { 
    title: "Product Library", 
    description: "Manage fabrics, hardware, vendors, and scan QR codes on the go", 
    Visual: Scene8Library, 
    duration: 14000, 
    chapter: "library" 
  },
  { 
    title: "Get Started", 
    description: "Step-by-step guidance on every page with global support", 
    Visual: Scene6Closing, 
    duration: 10000, 
    chapter: "closing" 
  },
];

const FLAG_NAME = "has_seen_welcome_video";

/**
 * Auto-triggers the welcome video for first-time users.
 * Uses database flag for cross-device persistence.
 */
export const WelcomeVideoAutoTrigger = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const markAsSeen = useCallback(async () => {
    if (!user) return;
    
    await supabase.from('app_user_flags').upsert({
      user_id: user.id,
      flag: FLAG_NAME,
      enabled: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,flag' });
  }, [user]);

  // Check database flag on mount
  useEffect(() => {
    if (!user || hasChecked) return;

    const checkWelcomeVideoStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('app_user_flags')
          .select('enabled')
          .eq('user_id', user.id)
          .eq('flag', FLAG_NAME)
          .maybeSingle();

        // If no flag or flag is false, show the video
        if (error || !data || !data.enabled) {
          // Small delay for smoother UX after login
          setTimeout(() => {
            setIsOpen(true);
          }, 800);
          // Mark as seen immediately to prevent showing on other devices during same session
          await markAsSeen();
        }
      } catch (err) {
        console.error("Failed to check welcome video status:", err);
      }
      setHasChecked(true);
    };

    checkWelcomeVideoStatus();
  }, [user, hasChecked, markAsSeen]);

  // Don't render anything until we've checked or if no user
  if (!hasChecked || !user) return null;

  return (
    <WelcomeVideoPlayer
      open={isOpen}
      onOpenChange={setIsOpen}
      steps={welcomeSteps}
      chapters={welcomeChapters}
    />
  );
};
