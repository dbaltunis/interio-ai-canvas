import { useState, useEffect } from "react";
import { useUserPreferences, useUpdateUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";

export const useAutoTimezone = () => {
  const { data: preferences, isLoading: preferencesLoading } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const { toast } = useToast();
  
  const [browserTimezone, setBrowserTimezone] = useState<string>('UTC');
  const [timezoneMismatch, setTimezoneMismatch] = useState(false);
  const [mismatchDismissed, setMismatchDismissed] = useState(false);
  
  // Detect browser timezone on mount
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setBrowserTimezone(detected);
    } catch (error) {
      console.warn('Could not detect timezone:', error);
      setBrowserTimezone('UTC');
    }
  }, []);
  
  // Check for timezone mismatch or auto-set on first use
  useEffect(() => {
    if (preferencesLoading || !browserTimezone) return;
    
    const savedTimezone = preferences?.timezone;
    
    // First time user - auto-set from browser (no manual setting exists)
    if (!savedTimezone) {
      console.log('[useAutoTimezone] First time user, auto-setting timezone to:', browserTimezone);
      updatePreferences.mutate(
        { timezone: browserTimezone },
        {
          onSuccess: () => {
            console.log('[useAutoTimezone] Successfully set timezone to:', browserTimezone);
          },
          onError: (error) => {
            console.error('[useAutoTimezone] Failed to set timezone:', error);
          }
        }
      );
    } else if (savedTimezone !== browserTimezone && !mismatchDismissed) {
      // Returning user in different location
      console.log('[useAutoTimezone] Timezone mismatch detected:', { 
        saved: savedTimezone, 
        browser: browserTimezone 
      });
      setTimezoneMismatch(true);
    } else {
      setTimezoneMismatch(false);
    }
  }, [preferences?.timezone, browserTimezone, preferencesLoading, mismatchDismissed]);
  
  const updateToDeviceTimezone = () => {
    updatePreferences.mutate(
      { timezone: browserTimezone },
      {
        onSuccess: () => {
          setTimezoneMismatch(false);
          setMismatchDismissed(false);
          toast({
            title: "Timezone Updated",
            description: `Your calendar now uses ${browserTimezone}`,
          });
        },
        onError: (error) => {
          console.error('[useAutoTimezone] Failed to update timezone:', error);
          toast({
            title: "Failed to update timezone",
            description: "Please try again or update in settings",
            variant: "destructive",
          });
        }
      }
    );
  };
  
  const dismissMismatch = () => {
    setMismatchDismissed(true);
    setTimezoneMismatch(false);
  };
  
  const getTimezoneDisplayName = (tz: string) => {
    try {
      // Get a friendly display name for the timezone
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: tz,
        timeZoneName: 'short'
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(now);
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      
      // Extract city name from timezone ID (e.g., "America/New_York" -> "New York")
      const cityName = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
      
      return `${cityName} (${tzPart?.value || tz})`;
    } catch {
      return tz;
    }
  };
  
  return {
    browserTimezone,
    savedTimezone: preferences?.timezone || browserTimezone,
    timezoneMismatch: timezoneMismatch && !mismatchDismissed,
    isLoading: preferencesLoading,
    updateToDeviceTimezone,
    dismissMismatch,
    getTimezoneDisplayName,
  };
};
