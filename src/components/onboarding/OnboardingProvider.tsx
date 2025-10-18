import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface OnboardingContextType {
  showChecklist: boolean;
  dismissChecklist: () => void;
  completeItem: (itemId: string) => void;
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
  const navigate = useNavigate();
  const [showChecklist, setShowChecklist] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

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
        // User hasn't completed onboarding, show checklist after a delay
        setTimeout(() => setShowChecklist(true), 3000);
      } else {
        setHasCompletedOnboarding(data.enabled);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const dismissChecklist = async () => {
    setShowChecklist(false);
    if (user) {
      await supabase.from("app_user_flags").upsert({
        user_id: user.id,
        flag: "onboarding_completed",
        enabled: true,
      });
      setHasCompletedOnboarding(true);
    }
  };

  const completeItem = (itemId: string) => {
    setCompletedItems(prev => [...prev, itemId]);
  };

  // Define checklist items
  const checklistItems = [
    {
      id: "view-projects",
      title: "Explore the Projects Dashboard",
      description: "See where you'll manage all your jobs",
      completed: completedItems.includes("view-projects"),
      action: () => {
        navigate("/?tab=projects");
        completeItem("view-projects");
      },
      actionLabel: "View Projects",
    },
    {
      id: "add-client",
      title: "Add Your First Client",
      description: "Build your client database",
      completed: completedItems.includes("add-client"),
      action: () => {
        navigate("/?tab=clients");
        completeItem("add-client");
      },
      actionLabel: "Go to CRM",
    },
    {
      id: "setup-library",
      title: "Set Up Product Library",
      description: "Configure templates and pricing",
      completed: completedItems.includes("setup-library"),
      action: () => {
        navigate("/?tab=inventory");
        completeItem("setup-library");
      },
      actionLabel: "Open Library",
    },
    {
      id: "configure-settings",
      title: "Configure Business Settings",
      description: "Customize pricing and templates",
      completed: completedItems.includes("configure-settings"),
      action: () => {
        navigate("/settings");
        completeItem("configure-settings");
      },
      actionLabel: "Open Settings",
    },
  ];

  return (
    <OnboardingContext.Provider
      value={{
        showChecklist,
        dismissChecklist,
        completeItem,
        hasCompletedOnboarding,
      }}
    >
      {children}
      <OnboardingChecklist
        isOpen={showChecklist}
        onDismiss={dismissChecklist}
        items={checklistItems}
        onItemComplete={completeItem}
      />
    </OnboardingContext.Provider>
  );
};
