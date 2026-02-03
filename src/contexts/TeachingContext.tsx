import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { allTeachingPoints, TeachingPoint, getNextInSequence, getTeachingPointsForPage } from '@/config/teachingPoints';

const STORAGE_KEY = 'teaching_progress';

interface TeachingProgress {
  seenTeachingPoints: string[];
  dismissedForever: string[];
  completedSequences: string[];
  clickedHelpButtons: string[];
  showCounts: Record<string, number>;  // Track how many times each teaching has been shown
  lastActivity: {
    page: string;
    section?: string;
    timestamp: number;
  } | null;
}

interface TeachingContextValue {
  // State
  activeTeaching: TeachingPoint | null;
  activeSpotlight: TeachingPoint | null;
  progress: TeachingProgress;
  isTeachingEnabled: boolean;
  
  // Actions
  showTeaching: (id: string) => void;
  dismissTeaching: (id: string) => void;
  dismissForever: (id: string) => void;
  completeTeaching: (id: string) => void;
  resetAllTeaching: () => void;
  setTeachingEnabled: (enabled: boolean) => void;
  
  // Spotlight actions
  showSpotlightForTip: (tip: TeachingPoint) => void;
  dismissSpotlight: () => void;
  
  // Queries
  hasSeenTeaching: (id: string) => boolean;
  isDismissedForever: (id: string) => boolean;
  isSessionDismissed: (id: string) => boolean;
  hasClickedHelpButton: (sectionId: string) => boolean;
  markHelpButtonClicked: (sectionId: string) => void;
  getAvailableTeachings: (page: string, section?: string) => TeachingPoint[];
  getNextTeaching: (page: string, section?: string) => TeachingPoint | null;
  
  // Page tracking
  setCurrentPage: (page: string, section?: string) => void;
}

const defaultProgress: TeachingProgress = {
  seenTeachingPoints: [],
  dismissedForever: [],
  completedSequences: [],
  clickedHelpButtons: [],
  showCounts: {},
  lastActivity: null,
};

const TeachingContext = createContext<TeachingContextValue | undefined>(undefined);

export const TeachingProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState<TeachingProgress>(defaultProgress);
  const [activeTeaching, setActiveTeaching] = useState<TeachingPoint | null>(null);
  const [activeSpotlight, setActiveSpotlight] = useState<TeachingPoint | null>(null);
  const [isTeachingEnabled, setIsTeachingEnabled] = useState(true);
  const [currentPage, setCurrentPageState] = useState<{ page: string; section?: string } | null>(null);
  const [initialized, setInitialized] = useState(false);
  // Session-only dismissed teachings (not persisted to localStorage)
  const [sessionDismissed, setSessionDismissed] = useState<string[]>([]);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProgress({ ...defaultProgress, ...parsed });
      }
    } catch (e) {
      console.error('Failed to load teaching progress:', e);
    }
    setInitialized(true);
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (e) {
        console.error('Failed to save teaching progress:', e);
      }
    }
  }, [progress, initialized]);

  // Check if user has seen a teaching point
  const hasSeenTeaching = useCallback((id: string): boolean => {
    return progress.seenTeachingPoints.includes(id);
  }, [progress.seenTeachingPoints]);

  // Check if user dismissed forever
  const isDismissedForever = useCallback((id: string): boolean => {
    return progress.dismissedForever.includes(id);
  }, [progress.dismissedForever]);

  // Check if dismissed for this session only (not persisted)
  const isSessionDismissed = useCallback((id: string): boolean => {
    return sessionDismissed.includes(id);
  }, [sessionDismissed]);

  // Get available teachings for current page/section
  const getAvailableTeachings = useCallback((page: string, section?: string): TeachingPoint[] => {
    if (!isTeachingEnabled) return [];
    
    return getTeachingPointsForPage(page, section).filter(tp => {
      // Skip if dismissed forever
      if (isDismissedForever(tp.id)) return false;
      
      // Check maxShows limit if defined
      if (tp.maxShows) {
        const showCount = progress.showCounts[tp.id] || 0;
        if (showCount >= tp.maxShows) return false;
      } else {
        // No maxShows defined - use standard "seen" check
        if (hasSeenTeaching(tp.id)) return false;
      }
      
      // Check trigger conditions
      switch (tp.trigger.type) {
        case 'first_visit':
          return true;
        case 'empty_state':
          // This would need to be checked contextually
          return true;
        case 'feature_unused':
          // This would need feature usage tracking
          return true;
        case 'time_on_page':
          // Handle time-based triggers elsewhere
          return false;
        case 'after_action':
          // Handle action-based triggers elsewhere
          return false;
        default:
          return true;
      }
    });
  }, [isTeachingEnabled, hasSeenTeaching, isDismissedForever, progress.showCounts]);

  // Get next teaching point for current context
  const getNextTeaching = useCallback((page: string, section?: string): TeachingPoint | null => {
    const available = getAvailableTeachings(page, section);
    if (available.length === 0) return null;
    
    // Prioritize by priority level
    const highPriority = available.filter(tp => tp.priority === 'high');
    if (highPriority.length > 0) return highPriority[0];
    
    const mediumPriority = available.filter(tp => tp.priority === 'medium');
    if (mediumPriority.length > 0) return mediumPriority[0];
    
    return available[0];
  }, [getAvailableTeachings]);

  // Show a specific teaching point and scroll to target element
  const showTeaching = useCallback((id: string) => {
    const teaching = allTeachingPoints.find(tp => tp.id === id);
    if (teaching && !isDismissedForever(id)) {
      // Scroll to target element if specified
      if (teaching.targetSelector) {
        const element = document.querySelector(teaching.targetSelector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Small delay to let scroll complete before showing popover
          setTimeout(() => {
            setActiveTeaching(teaching);
          }, 400);
          return;
        }
      }
      setActiveTeaching(teaching);
    }
  }, [isDismissedForever]);

  // Show spotlight overlay for a tip (after navigation)
  const showSpotlightForTip = useCallback((tip: TeachingPoint) => {
    setActiveSpotlight(tip);
  }, []);

  // Dismiss the spotlight overlay
  const dismissSpotlight = useCallback(() => {
    setActiveSpotlight(null);
  }, []);

  // Dismiss current teaching for this session only (will show again next session)
  const dismissTeaching = useCallback((id: string) => {
    // Only add to session dismissed, NOT to persistent seenTeachingPoints
    setSessionDismissed(prev => 
      prev.includes(id) ? prev : [...prev, id]
    );
    
    if (activeTeaching?.id === id) {
      setActiveTeaching(null);
    }
    if (activeSpotlight?.id === id) {
      setActiveSpotlight(null);
    }
  }, [activeTeaching, activeSpotlight]);

  // Dismiss forever (won't show again even after reset)
  const dismissForever = useCallback((id: string) => {
    setProgress(prev => ({
      ...prev,
      seenTeachingPoints: prev.seenTeachingPoints.includes(id) 
        ? prev.seenTeachingPoints 
        : [...prev.seenTeachingPoints, id],
      dismissedForever: prev.dismissedForever.includes(id)
        ? prev.dismissedForever
        : [...prev.dismissedForever, id],
    }));
    
    if (activeTeaching?.id === id) {
      setActiveTeaching(null);
    }
    if (activeSpotlight?.id === id) {
      setActiveSpotlight(null);
    }
  }, [activeTeaching, activeSpotlight]);

  // Complete teaching and optionally show next in sequence
  const completeTeaching = useCallback((id: string) => {
    dismissTeaching(id);
    
    // Check for next in sequence
    const next = getNextInSequence(id);
    if (next && !hasSeenTeaching(next.id) && !isDismissedForever(next.id)) {
      // Small delay before showing next
      setTimeout(() => {
        setActiveTeaching(next);
      }, 300);
    }
  }, [dismissTeaching, hasSeenTeaching, isDismissedForever]);

  // Reset all teaching progress (except permanently dismissed)
  const resetAllTeaching = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      seenTeachingPoints: [],
      completedSequences: [],
      // Keep dismissedForever and clickedHelpButtons intact
    }));
    setActiveTeaching(null);
    setActiveSpotlight(null);
  }, []);

  // Check if user has clicked a help button
  const hasClickedHelpButton = useCallback((sectionId: string): boolean => {
    return progress.clickedHelpButtons.includes(sectionId);
  }, [progress.clickedHelpButtons]);

  // Mark a help button as clicked
  const markHelpButtonClicked = useCallback((sectionId: string) => {
    setProgress(prev => ({
      ...prev,
      clickedHelpButtons: prev.clickedHelpButtons.includes(sectionId)
        ? prev.clickedHelpButtons
        : [...prev.clickedHelpButtons, sectionId],
    }));
  }, []);

  // Set current page for context-aware teaching
  const setCurrentPage = useCallback((page: string, section?: string) => {
    setCurrentPageState({ page, section });
    setProgress(prev => ({
      ...prev,
      lastActivity: {
        page,
        section,
        timestamp: Date.now(),
      },
    }));

    // Auto-show teaching for new page if enabled
    if (isTeachingEnabled && initialized) {
      const next = getNextTeaching(page, section);
      console.log('[Teaching] Page changed:', { page, section, next: next?.id, isTeachingEnabled, initialized });
      
      // Support first_visit and empty_state triggers for auto-show
      if (next && (next.trigger.type === 'first_visit' || next.trigger.type === 'empty_state')) {
        // Small delay to let page render
        setTimeout(() => {
          // Check maxShows limit if defined
          const showCount = progress.showCounts[next.id] || 0;
          const maxShows = next.maxShows;
          const withinMaxShows = !maxShows || showCount < maxShows;
          
          if (!hasSeenTeaching(next.id) && !isDismissedForever(next.id) && withinMaxShows) {
            console.log('[Teaching] Showing teaching:', next.id, { showCount, maxShows });
            // Increment show count
            setProgress(prev => ({
              ...prev,
              showCounts: {
                ...prev.showCounts,
                [next.id]: (prev.showCounts[next.id] || 0) + 1,
              },
            }));
            setActiveTeaching(next);
          }
        }, 500);
      }
    }
  }, [isTeachingEnabled, initialized, getNextTeaching, hasSeenTeaching, isDismissedForever, progress.showCounts]);

  const value: TeachingContextValue = {
    activeTeaching,
    activeSpotlight,
    progress,
    isTeachingEnabled,
    showTeaching,
    dismissTeaching,
    dismissForever,
    completeTeaching,
    resetAllTeaching,
    setTeachingEnabled: setIsTeachingEnabled,
    showSpotlightForTip,
    dismissSpotlight,
    hasSeenTeaching,
    isDismissedForever,
    isSessionDismissed,
    hasClickedHelpButton,
    markHelpButtonClicked,
    getAvailableTeachings,
    getNextTeaching,
    setCurrentPage,
  };

  return (
    <TeachingContext.Provider value={value}>
      {children}
    </TeachingContext.Provider>
  );
};

export const useTeaching = (): TeachingContextValue => {
  const context = useContext(TeachingContext);
  if (!context) {
    throw new Error('useTeaching must be used within a TeachingProvider');
  }
  return context;
};

// Hook for page-level teaching integration
export const usePageTeaching = (page: string, section?: string) => {
  const { setCurrentPage, getAvailableTeachings, activeTeaching, showTeaching } = useTeaching();
  
  useEffect(() => {
    setCurrentPage(page, section);
  }, [page, section, setCurrentPage]);
  
  const availableTeachings = getAvailableTeachings(page, section);
  const hasTeachingsAvailable = availableTeachings.length > 0;
  
  return {
    availableTeachings,
    hasTeachingsAvailable,
    activeTeaching: activeTeaching?.trigger.page === page ? activeTeaching : null,
    showTeaching,
  };
};
