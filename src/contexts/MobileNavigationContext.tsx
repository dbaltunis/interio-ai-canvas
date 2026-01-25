import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface NavigationState {
  history: string[];
  direction: number; // -1 for back, 1 for forward, 0 for initial
  previousTab: string | null;
}

interface MobileNavigationContextType {
  history: string[];
  direction: number;
  previousTab: string | null;
  navigateTo: (tab: string) => void;
  goBack: () => string | null;
  canGoBack: boolean;
}

const MobileNavigationContext = createContext<MobileNavigationContextType | null>(null);

const TAB_ORDER = ["dashboard", "projects", "clients", "calendar", "settings"];
const MAX_HISTORY = 10;

export function MobileNavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavigationState>({
    history: [],
    direction: 0,
    previousTab: null,
  });

  const navigateTo = useCallback((tab: string) => {
    setState(prev => {
      const currentTab = prev.history[prev.history.length - 1];
      if (currentTab === tab) return prev;

      const currentIndex = TAB_ORDER.indexOf(currentTab || "dashboard");
      const newIndex = TAB_ORDER.indexOf(tab);
      const direction = newIndex > currentIndex ? 1 : -1;

      const newHistory = [...prev.history, tab].slice(-MAX_HISTORY);

      return {
        history: newHistory,
        direction,
        previousTab: currentTab || null,
      };
    });
  }, []);

  const goBack = useCallback((): string | null => {
    let previousTab: string | null = null;
    
    setState(prev => {
      if (prev.history.length <= 1) return prev;
      
      const newHistory = prev.history.slice(0, -1);
      previousTab = newHistory[newHistory.length - 1] || null;
      
      return {
        history: newHistory,
        direction: -1,
        previousTab: prev.history[prev.history.length - 1] || null,
      };
    });
    
    return previousTab;
  }, []);

  const canGoBack = state.history.length > 1;

  return (
    <MobileNavigationContext.Provider
      value={{
        history: state.history,
        direction: state.direction,
        previousTab: state.previousTab,
        navigateTo,
        goBack,
        canGoBack,
      }}
    >
      {children}
    </MobileNavigationContext.Provider>
  );
}

export function useMobileNavigation() {
  const context = useContext(MobileNavigationContext);
  if (!context) {
    // Return a no-op version for SSR or non-mobile contexts
    return {
      history: [],
      direction: 0,
      previousTab: null,
      navigateTo: () => {},
      goBack: () => null,
      canGoBack: false,
    };
  }
  return context;
}
