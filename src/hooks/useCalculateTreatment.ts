/**
 * useCalculateTreatment Hook
 *
 * React hook for calculating treatment pricing using the unified algorithm module.
 *
 * This hook:
 * 1. Uses the single source of truth (src/algorithms)
 * 2. Stores BOTH cost and selling prices
 * 3. Invalidates all related caches after save
 * 4. Provides consistent results across the entire app
 *
 * USAGE:
 * const { calculate, save, isCalculating, result } = useCalculateTreatment();
 *
 * // Calculate (preview)
 * const preview = await calculate(input);
 *
 * // Calculate and save
 * const saved = await save(windowId, input);
 */

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  calculateTreatment,
  validateCalculationInput,
  TreatmentCalculationInput,
  TreatmentCalculationResult,
} from '@/algorithms';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UseCalculateTreatmentResult {
  // State
  isCalculating: boolean;
  isSaving: boolean;
  lastResult: TreatmentCalculationResult | null;
  lastError: string | null;

  // Actions
  calculate: (input: TreatmentCalculationInput) => TreatmentCalculationResult | null;
  save: (windowId: string, input: TreatmentCalculationInput, projectId?: string) => Promise<TreatmentCalculationResult | null>;
  validate: (input: TreatmentCalculationInput) => string[];
}

export function useCalculateTreatment(): UseCalculateTreatmentResult {
  const queryClient = useQueryClient();
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastResult, setLastResult] = useState<TreatmentCalculationResult | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  /**
   * Calculate without saving (for preview/live updates)
   */
  const calculate = useCallback((input: TreatmentCalculationInput): TreatmentCalculationResult | null => {
    setIsCalculating(true);
    setLastError(null);

    try {
      // Validate first
      const validationErrors = validateCalculationInput(input);
      if (validationErrors.length > 0) {
        setLastError(validationErrors.join(', '));
        setIsCalculating(false);
        return null;
      }

      // Run calculation
      const result = calculateTreatment(input);
      setLastResult(result);
      setIsCalculating(false);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Calculation failed';
      setLastError(message);
      console.error('[useCalculateTreatment] Error:', error);
      setIsCalculating(false);
      return null;
    }
  }, []);

  /**
   * Validate inputs without calculating
   */
  const validate = useCallback((input: TreatmentCalculationInput): string[] => {
    return validateCalculationInput(input);
  }, []);

  /**
   * Calculate AND save to database
   * This ensures total_selling is always stored alongside total_cost
   */
  const save = useCallback(async (
    windowId: string,
    input: TreatmentCalculationInput,
    projectId?: string
  ): Promise<TreatmentCalculationResult | null> => {
    setIsSaving(true);
    setLastError(null);

    try {
      // First, calculate
      const result = calculate(input);
      if (!result) {
        setIsSaving(false);
        return null;
      }

      // Save to windows_summary table
      // CRITICAL: We save BOTH total_cost AND total_selling
      const { error: saveError } = await supabase
        .from('windows_summary')
        .upsert({
          window_id: windowId,
          // Quantities
          linear_meters: result.linear_meters,
          widths_required: result.widths_required,
          // Costs
          fabric_cost: result.fabric_cost,
          manufacturing_cost: result.manufacturing_cost,
          options_cost: result.options_cost,
          total_cost: result.total_cost,
          // CRITICAL: Store selling price so we don't recalculate
          total_selling: result.total_selling,
          // Markup info for audit trail
          markup_percentage: result.markup_percentage,
          markup_source: result.markup_source,
          // Algorithm version for debugging
          algorithm_version: result.algorithm_version,
          // Timestamp
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'window_id',
        });

      if (saveError) {
        throw new Error(`Failed to save calculation: ${saveError.message}`);
      }

      // Invalidate ALL related caches to ensure UI updates
      await invalidateAllCaches(queryClient, windowId, projectId);

      setLastResult(result);
      setIsSaving(false);

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save failed';
      setLastError(message);
      console.error('[useCalculateTreatment] Save error:', error);
      toast.error('Failed to save calculation');
      setIsSaving(false);
      return null;
    }
  }, [calculate, queryClient]);

  return {
    isCalculating,
    isSaving,
    lastResult,
    lastError,
    calculate,
    save,
    validate,
  };
}

/**
 * Invalidate all caches related to a calculation
 * This ensures the UI updates everywhere after a save
 */
async function invalidateAllCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  windowId: string,
  projectId?: string
): Promise<void> {
  // Build list of query keys to invalidate
  const keysToInvalidate = [
    ['window-summary', windowId],
    ['window-summary'],
    ['treatments'],
    ['quote-items'],
    ['quotes'],
    ['workshop-items'],
  ];

  if (projectId) {
    keysToInvalidate.push(
      ['project', projectId],
      ['project-window-summaries', projectId],
      ['treatments', projectId],
      ['quote-items', projectId],
      ['quotes', projectId],
      ['workshop-items', projectId]
    );
  }

  // Invalidate all at once
  await Promise.all(
    keysToInvalidate.map(key =>
      queryClient.invalidateQueries({ queryKey: key })
    )
  );

  // Force immediate refetch of critical data
  if (projectId) {
    await queryClient.refetchQueries({
      queryKey: ['project-window-summaries', projectId],
    });
  }
}

// ============================================================
// Export helper for direct algorithm access
// ============================================================

export { calculateTreatment, validateCalculationInput } from '@/algorithms';
