import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Tutorial, TutorialStep, getTutorialById } from '@/config/tutorials';

interface TutorialState {
  isPlaying: boolean;
  currentTutorial: Tutorial | null;
  currentStepIndex: number;
  isPaused: boolean;
  completedTutorials: string[];
}

interface TutorialContextValue extends TutorialState {
  startTutorial: (tutorialId: string) => void;
  stopTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  pauseTutorial: () => void;
  resumeTutorial: () => void;
  goToStep: (index: number) => void;
  markAsCompleted: (tutorialId: string) => void;
  isTutorialCompleted: (tutorialId: string) => boolean;
  currentStep: TutorialStep | null;
  progress: number;
  totalSteps: number;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

const STORAGE_KEY = 'completed-tutorials';

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TutorialState>({
    isPlaying: false,
    currentTutorial: null,
    currentStepIndex: 0,
    isPaused: false,
    completedTutorials: [],
  });

  // Load completed tutorials from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setState(prev => ({ ...prev, completedTutorials: JSON.parse(saved) }));
      }
    } catch (e) {
      console.error('Failed to load completed tutorials:', e);
    }
  }, []);

  const startTutorial = useCallback((tutorialId: string) => {
    const tutorial = getTutorialById(tutorialId);
    if (!tutorial) {
      console.warn(`Tutorial not found: ${tutorialId}`);
      return;
    }

    setState(prev => ({
      ...prev,
      isPlaying: true,
      currentTutorial: tutorial,
      currentStepIndex: 0,
      isPaused: false,
    }));
  }, []);

  const stopTutorial = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTutorial: null,
      currentStepIndex: 0,
      isPaused: false,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      if (!prev.currentTutorial) return prev;
      
      const nextIndex = prev.currentStepIndex + 1;
      if (nextIndex >= prev.currentTutorial.steps.length) {
        // Tutorial completed
        const newCompleted = [...prev.completedTutorials, prev.currentTutorial.id];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCompleted));
        
        return {
          ...prev,
          isPlaying: false,
          currentTutorial: null,
          currentStepIndex: 0,
          completedTutorials: newCompleted,
        };
      }

      return { ...prev, currentStepIndex: nextIndex };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }));
  }, []);

  const pauseTutorial = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeTutorial = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const goToStep = useCallback((index: number) => {
    setState(prev => {
      if (!prev.currentTutorial) return prev;
      const clampedIndex = Math.max(0, Math.min(index, prev.currentTutorial.steps.length - 1));
      return { ...prev, currentStepIndex: clampedIndex };
    });
  }, []);

  const markAsCompleted = useCallback((tutorialId: string) => {
    setState(prev => {
      if (prev.completedTutorials.includes(tutorialId)) return prev;
      const newCompleted = [...prev.completedTutorials, tutorialId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCompleted));
      return { ...prev, completedTutorials: newCompleted };
    });
  }, []);

  const isTutorialCompleted = useCallback((tutorialId: string) => {
    return state.completedTutorials.includes(tutorialId);
  }, [state.completedTutorials]);

  const currentStep = state.currentTutorial?.steps[state.currentStepIndex] || null;
  const totalSteps = state.currentTutorial?.steps.length || 0;
  const progress = totalSteps > 0 ? ((state.currentStepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <TutorialContext.Provider
      value={{
        ...state,
        startTutorial,
        stopTutorial,
        nextStep,
        prevStep,
        pauseTutorial,
        resumeTutorial,
        goToStep,
        markAsCompleted,
        isTutorialCompleted,
        currentStep,
        progress,
        totalSteps,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
