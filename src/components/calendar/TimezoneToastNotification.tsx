import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimezoneToastNotificationProps {
  browserTimezone: string;
  savedTimezone: string;
  onUpdate: () => void;
  onDismiss: () => void;
  getTimezoneDisplayName: (tz: string) => string;
}

const SESSION_KEY = 'timezone-toast-shown';

export const useTimezoneToast = ({
  browserTimezone,
  savedTimezone,
  timezoneMismatch,
  onUpdate,
  onDismiss,
  getTimezoneDisplayName,
}: {
  browserTimezone: string;
  savedTimezone: string;
  timezoneMismatch: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
  getTimezoneDisplayName: (tz: string) => string;
}) => {
  const toastShownRef = useRef(false);
  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    // Only show if mismatch exists and not already shown this session
    if (!timezoneMismatch) {
      return;
    }

    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    if (alreadyShown || toastShownRef.current) {
      return;
    }

    toastShownRef.current = true;
    sessionStorage.setItem(SESSION_KEY, 'true');

    const browserDisplay = getTimezoneDisplayName(browserTimezone);
    const savedDisplay = getTimezoneDisplayName(savedTimezone);
    const browserShort = browserDisplay.split(' ')[0];
    const savedShort = savedDisplay.split(' ')[0];

    toastIdRef.current = toast.custom(
      (id) => (
        <div className="bg-background border border-border rounded-xl shadow-lg p-4 w-[360px] animate-slide-in-right">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">Different Timezone Detected</p>
                <button 
                  onClick={() => {
                    toast.dismiss(id);
                    onDismiss();
                  }}
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your device is in <span className="font-medium text-foreground">{browserDisplay}</span>, but your calendar uses <span className="font-medium text-foreground">{savedDisplay}</span>
              </p>
              <div className="flex gap-2 pt-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    toast.dismiss(id);
                    onDismiss();
                  }}
                  className="text-xs h-7 flex-1"
                >
                  Keep {savedShort}
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => {
                    toast.dismiss(id);
                    onUpdate();
                  }}
                  className="text-xs h-7 flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Use {browserShort}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-right',
      }
    );

    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, [timezoneMismatch, browserTimezone, savedTimezone, onUpdate, onDismiss, getTimezoneDisplayName]);
};
