import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { WelcomeTour } from "./WelcomeTour";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

interface OnboardingContextType {
  showTour: boolean;
  startTour: () => void;
  skipTour: () => void;
  completeTour: () => void;
  hasCompletedOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showTour, setShowTour] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Memoize the tab change handler to prevent re-renders
  const handleTabChange = useCallback((tab: string) => {
    setSearchParams({ tab }, { replace: true });
  }, [setSearchParams]);

  // Check if user has completed onboarding
  useEffect(() => {
    if (!user) return;

    const checkOnboardingStatus = async () => {
      const { data, error } = await supabase
        .from("app_user_flags")
        .select("enabled")
        .eq("user_id", user.id)
        .eq("flag", "onboarding_completed")
        .single();

      if (error || !data) {
        // User hasn't completed onboarding, show tour after a delay
        setTimeout(() => setShowTour(true), 2000);
      } else {
        setHasCompletedOnboarding(data.enabled);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const startTour = () => {
    setShowTour(true);
  };

  const skipTour = async () => {
    setShowTour(false);
    if (user) {
      await markOnboardingComplete();
    }
  };

  const completeTour = async () => {
    setShowTour(false);
    if (user) {
      await markOnboardingComplete();
    }
  };

  const markOnboardingComplete = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("app_user_flags")
      .upsert({
        user_id: user.id,
        flag: "onboarding_completed",
        enabled: true,
      });

    if (!error) {
      setHasCompletedOnboarding(true);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        showTour,
        startTour,
        skipTour,
        completeTour,
        hasCompletedOnboarding,
      }}
    >
      {children}
      <WelcomeTour 
        isOpen={showTour} 
        onComplete={completeTour} 
        onSkip={skipTour} 
        onTabChange={handleTabChange}
      />
    </OnboardingContext.Provider>
  );
};
