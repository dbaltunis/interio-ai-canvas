import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Zap, Users, Wrench, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION, APP_BUILD_DATE } from "@/constants/version";
import { format, parseISO } from "date-fns";

const LAST_SEEN_VERSION_KEY = "interioapp_last_seen_version";

interface UpdateSection {
  icon: React.ReactNode;
  title: string;
  items: string[];
}

const updateContent: UpdateSection[] = [
  {
    icon: <Zap className="h-4 w-4" />,
    title: "Highlights",
    items: [
      "4x Performance Improvement — Database compute upgraded for faster loading across all features",
      "Team Access Control (Australasia) — Invite users and limit project access with granular permissions",
      "Project Creation Fixed — Resolved \"Failed to create\" error for all user types",
    ],
  },
  {
    icon: <Users className="h-4 w-4" />,
    title: "New Features",
    items: [
      "Multi-Team Assignment — Delegate projects to multiple team members with owner/staff avatars displayed inline",
      "Limit Access Feature — Control which team members can see specific projects",
    ],
  },
  {
    icon: <Wrench className="h-4 w-4" />,
    title: "Improvements",
    items: [
      "Document numbering sequences stabilized",
      "Markup settings preserve explicit 0% values",
      "Work order sharing fixed for all users",
      "Notification system reliability improved",
    ],
  },
  {
    icon: <Shield className="h-4 w-4" />,
    title: "Security",
    items: [
      "Enhanced RLS policies for notifications",
      "Improved function security for bypass checks",
    ],
  },
];

export const UpdateAnnouncementModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem(LAST_SEEN_VERSION_KEY);
    
    // Show modal if no version stored or version is different
    if (!lastSeenVersion || lastSeenVersion !== APP_VERSION) {
      // Small delay for smoother page load experience
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(LAST_SEEN_VERSION_KEY, APP_VERSION);
    setIsVisible(false);
  };

  const formattedDate = (() => {
    try {
      return format(parseISO(APP_BUILD_DATE), "MMMM d, yyyy");
    } catch {
      return APP_BUILD_DATE;
    }
  })();

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-[9999] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-6 text-center border-b border-border/50">
                <div className="inline-flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    What's New
                  </span>
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-1">
                  Version {APP_VERSION}
                </h2>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
              </div>

              {/* Content */}
              <div className="px-6 py-5 max-h-[50vh] overflow-y-auto space-y-5">
                {updateContent.map((section, sectionIndex) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + sectionIndex * 0.05 }}
                  >
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                        {section.icon}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                        {section.title}
                      </h3>
                    </div>
                    <ul className="space-y-2 pl-8">
                      {section.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="text-sm text-muted-foreground leading-relaxed relative before:content-['•'] before:absolute before:-left-4 before:text-primary/60"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border/50 bg-muted/30">
                <Button
                  onClick={handleDismiss}
                  className="w-full h-11 rounded-xl font-medium"
                  size="lg"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Got it, thanks
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
