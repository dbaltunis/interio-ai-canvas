import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { allTeachingPoints, TeachingPoint, getNextInSequence, getTeachingPointsForPage } from '@/config/teachingPoints';

const STORAGE_KEY = 'teaching_progress';

interface TeachingProgress {
  seenTeachingPoints: string[];
  dismissedForever: string[];
  completedSequences: string[];
  lastActivity: {
    page: string;
    section?: string;
    timestamp: number;
  } | null;
}

interface TeachingContextValue {
  // State
  activeTeaching: TeachingPoint | null;
  progress: TeachingProgress;
  isTeachingEnabled: boolean;
  
  // Actions
  showTeaching: (id: string) => void;
  dismissTeaching: (id: string) => void;
  dismissForever: (id: string) => void;
  completeTeaching: (id: string) => void;
  resetAllTeaching: () => void;
  setTeachingEnabled: (enabled: boolean) => void;
  
  // Queries
  hasSeenTeaching: (id: string) => boolean;
  isDismissedForever: (id: string) => boolean;
  getAvailableTeachings: (page: string, section?: string) => TeachingPoint[];
  getNextTeaching: (page: string, section?: string) => TeachingPoint | null;
  
  // Page tracking
  setCurrentPage: (page: string, section?: string) => void;
}

const defaultProgress: TeachingProgress = {
  seenTeachingPoints: [],
  dismissedForever: [],
  completedSequences: [],
  lastActivity: null,
};

const TeachingContext = createContext<TeachingContextValue | undefined>(undefined);

export const TeachingProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState<TeachingProgress>(defaultProgress);
  const [activeTeaching, setActiveTeaching] = useState<TeachingPoint | null>(null);
  const [isTeachingEnabled, setIsTeachingEnabled] = useState(true);
  const [currentPage, setCurrentPageState] = useState<{ page: string; section?: string } | null>(null);
  const [initialized, setInitialized] = useState(false);

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

  // Get available teachings for current page/section
  const getAvailableTeachings = useCallback((page: string, section?: string): TeachingPoint[] => {
    if (!isTeachingEnabled) return [];
    
    return getTeachingPointsForPage(page, section).filter(tp => {
      // Skip if already seen or dismissed forever
      if (hasSeenTeaching(tp.id) || isDismissedForever(tp.id)) return false;
      
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
  }, [isTeachingEnabled, hasSeenTeaching, isDismissedForever]);

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

  // Show a specific teaching point
  const showTeaching = useCallback((id: string) => {
    const teaching = allTeachingPoints.find(tp => tp.id === id);
    if (teaching && !isDismissedForever(id)) {
      setActiveTeaching(teaching);
    }
  }, [isDismissedForever]);

  // Dismiss current teaching (mark as seen)
  const dismissTeaching = useCallback((id: string) => {
    setProgress(prev => ({
      ...prev,
      seenTeachingPoints: prev.seenTeachingPoints.includes(id) 
        ? prev.seenTeachingPoints 
        : [...prev.seenTeachingPoints, id],
    }));
    
    if (activeTeaching?.id === id) {
      setActiveTeaching(null);
    }
  }, [activeTeaching]);

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
  }, [activeTeaching]);

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
      // Keep dismissedForever intact
    }));
    setActiveTeaching(null);
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
      if (next && next.trigger.type === 'first_visit') {
        // Small delay to let page render
        setTimeout(() => {
          if (!hasSeenTeaching(next.id) && !isDismissedForever(next.id)) {
            setActiveTeaching(next);
          }
        }, 500);
      }
    }
  }, [isTeachingEnabled, initialized, getNextTeaching, hasSeenTeaching, isDismissedForever]);

  const value: TeachingContextValue = {
    activeTeaching,
    progress,
    isTeachingEnabled,
    showTeaching,
    dismissTeaching,
    dismissForever,
    completeTeaching,
    resetAllTeaching,
    setTeachingEnabled: setIsTeachingEnabled,
    hasSeenTeaching,
    isDismissedForever,
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
