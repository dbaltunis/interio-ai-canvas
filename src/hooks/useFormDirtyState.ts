import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook to track if form values have changed from their original state.
 * Returns hasChanges boolean and functions to track/reset state.
 * 
 * @param currentValues - The current form values
 * @param originalValues - The original/saved values to compare against
 * @param isLoading - Whether data is still loading (prevents false positives)
 */
export function useFormDirtyState<T>(
  currentValues: T | null | undefined,
  originalValues: T | null | undefined,
  isLoading: boolean = false
): {
  hasChanges: boolean;
  resetDirtyState: () => void;
  markAsSaved: () => void;
} {
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const initialLoadComplete = useRef(false);

  // Create a stable string representation for comparison
  const serialize = useCallback((value: T | null | undefined): string => {
    if (value === null || value === undefined) return "";
    try {
      return JSON.stringify(value, Object.keys(value as object).sort());
    } catch {
      return "";
    }
  }, []);

  // Initialize snapshot when original values load
  useEffect(() => {
    if (!isLoading && originalValues !== undefined && originalValues !== null && !initialLoadComplete.current) {
      const snapshot = serialize(originalValues);
      setSavedSnapshot(snapshot);
      initialLoadComplete.current = true;
    }
  }, [originalValues, isLoading, serialize]);

  // Calculate if current values differ from saved snapshot
  const hasChanges = useCallback((): boolean => {
    if (isLoading || savedSnapshot === null || currentValues === null || currentValues === undefined) {
      return false;
    }
    const currentSnapshot = serialize(currentValues);
    return currentSnapshot !== savedSnapshot;
  }, [currentValues, savedSnapshot, isLoading, serialize]);

  // Reset dirty state (e.g., after cancel)
  const resetDirtyState = useCallback(() => {
    if (originalValues !== null && originalValues !== undefined) {
      setSavedSnapshot(serialize(originalValues));
    }
  }, [originalValues, serialize]);

  // Mark current values as saved (updates snapshot to current)
  const markAsSaved = useCallback(() => {
    if (currentValues !== null && currentValues !== undefined) {
      setSavedSnapshot(serialize(currentValues));
    }
  }, [currentValues, serialize]);

  return {
    hasChanges: hasChanges(),
    resetDirtyState,
    markAsSaved
  };
}

/**
 * Simpler hook for tracking changes to primitive values or simple objects
 */
export function useSimpleDirtyState<T>(
  currentValue: T,
  originalValue: T,
  isLoading: boolean = false
): boolean {
  const [savedValue, setSavedValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    if (!isLoading && originalValue !== undefined) {
      setSavedValue(originalValue);
    }
  }, [originalValue, isLoading]);

  if (isLoading || savedValue === undefined) {
    return false;
  }

  // Deep compare for objects, simple compare for primitives
  if (typeof currentValue === 'object' && currentValue !== null) {
    return JSON.stringify(currentValue) !== JSON.stringify(savedValue);
  }
  
  return currentValue !== savedValue;
}
