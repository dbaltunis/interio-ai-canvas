import { useState, useEffect } from "react";
import { X, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/constants/version";

const LAST_SEEN_VERSION_KEY = "interioapp_last_seen_version";

export const UpdateBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem(LAST_SEEN_VERSION_KEY);
    
    // Show banner if no version stored or version is different
    if (!lastSeenVersion || lastSeenVersion !== APP_VERSION) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(LAST_SEEN_VERSION_KEY, APP_VERSION);
    setIsVisible(false);
  };

  const handleRefresh = () => {
    localStorage.setItem(LAST_SEEN_VERSION_KEY, APP_VERSION);
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] animate-fade-in">
      <div className="bg-gradient-to-r from-blue-500/10 via-primary/5 to-blue-500/10 
                      border-b border-blue-200 dark:border-blue-800/50 
                      px-4 py-2.5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Message */}
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-foreground">
              <span className="font-medium">New update available</span>
              <span className="text-muted-foreground ml-1">(v{APP_VERSION})</span>
              <span className="hidden sm:inline text-muted-foreground"> • Save your work and refresh for the latest features</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              size="sm" 
              onClick={handleRefresh}
              className="h-7 px-3 text-xs font-medium rounded-full"
            >
              <RefreshCw className="h-3 w-3 mr-1.5" />
              Refresh Now
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground 
                         hover:bg-foreground/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
