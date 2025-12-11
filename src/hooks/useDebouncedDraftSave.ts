import { useCallback, useRef, useEffect } from 'react';
import { draftService } from '@/services/draftService';

interface DraftData {
  windowId: string;
  templateId?: string;
  fabricId?: string;
  hardwareId?: string;
  materialId?: string;
  measurements: Record<string, any>;
  selectedOptions: any[];
  selectedHeading?: string;
  selectedLining?: string;
  windowType?: any;
}

/**
 * Hook for debounced draft saving - saves immediately on changes with 500ms debounce
 * to prevent excessive localStorage writes while still capturing changes quickly
 */
export const useDebouncedDraftSave = (surfaceId: string | undefined, debounceMs = 500) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  const saveDraft = useCallback((data: Omit<DraftData, 'windowId'>) => {
    if (!surfaceId) return;

    // Cancel any pending save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Create serialized state for comparison
    const serialized = JSON.stringify(data);
    
    // Skip if nothing changed
    if (serialized === lastSavedRef.current) return;

    // Schedule debounced save
    timeoutRef.current = setTimeout(() => {
      draftService.saveDraft(surfaceId, {
        windowId: surfaceId,
        ...data
      });
      lastSavedRef.current = serialized;
    }, debounceMs);
  }, [surfaceId, debounceMs]);

  // Save immediately (bypass debounce) - for dialog close
  const saveImmediately = useCallback((data: Omit<DraftData, 'windowId'>) => {
    if (!surfaceId) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    draftService.saveDraft(surfaceId, {
      windowId: surfaceId,
      ...data
    });
    lastSavedRef.current = JSON.stringify(data);
  }, [surfaceId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { saveDraft, saveImmediately };
};
