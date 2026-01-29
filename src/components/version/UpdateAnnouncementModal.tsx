import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Zap, Users, Wrench, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION, APP_BUILD_DATE } from "@/constants/version";
import { format, parseISO } from "date-fns";

const LAST_SEEN_VERSION_KEY = "interioapp_last_seen_version";

interface UpdateSection {
  icon: React.ReactNode;
  title: string;
  items: string[];
}

const highlightsSection: UpdateSection = {
  icon: <Zap className="h-3.5 w-3.5" />,
  title: "Highlights",
  items: [
    "4x Performance Improvement",
    "Team Access Control (Australasia)",
    "Project Creation Fixed",
  ],
};

const additionalSections: UpdateSection[] = [
  {
    icon: <Users className="h-3.5 w-3.5" />,
    title: "New Features",
    items: [
      "Multi-Team Assignment with avatars",
      "Limit Access for specific projects",
    ],
  },
  {
    icon: <Wrench className="h-3.5 w-3.5" />,
    title: "Improvements",
    items: [
      "Document numbering stabilized",
      "Markup settings preserve 0% values",
      "Work order sharing fixed",
      "Notification reliability improved",
    ],
  },
  {
    icon: <Shield className="h-3.5 w-3.5" />,
    title: "Security",
    items: [
      "Enhanced RLS policies",
      "Improved function security",
    ],
  },
];

export const UpdateAnnouncementModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem(LAST_SEEN_VERSION_KEY);
    
    if (!lastSeenVersion || lastSeenVersion !== APP_VERSION) {
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

  const renderSection = (section: UpdateSection, index: number, delay: number = 0) => (
    <motion.div
      key={section.title}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay + index * 0.03 }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary">
          {section.icon}
        </div>
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
          {section.title}
        </h3>
      </div>
      <ul className="space-y-1 pl-6.5">
        {section.items.map((item, itemIndex) => (
          <li
            key={itemIndex}
            className="text-xs text-muted-foreground leading-relaxed relative before:content-['•'] before:absolute before:-left-3 before:text-primary/60"
          >
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-4 py-4 text-center border-b border-border/50">
                <div className="inline-flex items-center justify-center gap-1.5 mb-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    What's New
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Version {APP_VERSION}
                </h2>
                <p className="text-xs text-muted-foreground">{formattedDate}</p>
              </div>

              {/* Content - Scrollable */}
              <div className="px-4 py-3 overflow-y-auto flex-1">
                {/* Highlights - Always visible */}
                {renderSection(highlightsSection, 0)}

                {/* Expand/Collapse Toggle */}
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full flex items-center justify-center gap-1 mt-3 py-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`} />
                  {showAll ? "Show less" : "View all updates"}
                </button>

                {/* Additional Sections - Expandable */}
                <AnimatePresence>
                  {showAll && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 space-y-3">
                        {additionalSections.map((section, index) => 
                          renderSection(section, index, 0.05)
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
                <Button
                  onClick={handleDismiss}
                  className="w-full h-9 rounded-lg font-medium text-sm"
                  size="sm"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
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
