/**
 * Entity Validation Utilities
 * Provides reusable validation for detecting deleted/orphaned records
 * to prevent confusing error states in the UI.
 */

import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface ValidationResult {
  exists: boolean;
  name?: string | null;
  data?: any;
}

/**
 * Validate that an entity exists in the database
 * @param table - The table name to check
 * @param id - The entity ID to validate
 * @param selectColumns - Columns to select (default: 'id, name')
 * @returns ValidationResult with exists flag and optional name
 */
export const validateEntityExists = async (
  table: string,
  id: string,
  selectColumns = 'id, name'
): Promise<ValidationResult> => {
  if (!id) return { exists: false };
  
  try {
    // Use a raw query approach to avoid type constraints
    const { data, error } = await supabase
      .from(table as any)
      .select(selectColumns)
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.warn(`Entity validation error for ${table}:${id}:`, error);
      return { exists: false };
    }
    
    return data 
      ? { exists: true, name: (data as any).name || null, data } 
      : { exists: false };
  } catch (err) {
    console.error(`Entity validation failed for ${table}:${id}:`, err);
    return { exists: false };
  }
};

/**
 * React hook to validate an entity exists with automatic toast notification
 * @param table - The table name to check
 * @param id - The entity ID to validate (null/undefined skips validation)
 * @param options - Configuration options
 */
export const useValidatedEntity = (
  table: string,
  id: string | null | undefined,
  options?: {
    onNotFound?: () => void;
    entityLabel?: string; // Human-readable label like "template" or "fabric"
    showToast?: boolean;
    selectColumns?: string;
  }
) => {
  const { toast } = useToast();
  const entityLabel = options?.entityLabel || table.replace(/_/g, ' ');
  
  const query = useQuery({
    queryKey: ['validate-entity', table, id],
    queryFn: () => validateEntityExists(table, id!, options?.selectColumns),
    enabled: !!id,
    staleTime: 30000, // Cache for 30 seconds
    retry: false,
  });
  
  // Handle not found state
  useEffect(() => {
    if (query.data && query.data.exists === false && id) {
      if (options?.showToast !== false) {
        toast({
          title: `${entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)} not found`,
          description: `The previously selected ${entityLabel} may have been deleted or deactivated. Please select a different one.`,
          variant: "destructive",
        });
      }
      options?.onNotFound?.();
    }
  }, [query.data, id, entityLabel, options, toast]);
  
  return {
    ...query,
    isValid: query.data?.exists ?? null,
    entityName: query.data?.name,
    isNotFound: query.data?.exists === false && !!id,
  };
};

/**
 * Validate multiple entities at once (batch validation)
 * @param validations - Array of {table, id, label} objects
 * @returns Map of id -> ValidationResult
 */
export const validateEntitiesBatch = async (
  validations: Array<{ table: string; id: string; label?: string }>
): Promise<Map<string, ValidationResult>> => {
  const results = new Map<string, ValidationResult>();
  
  // Group by table for efficiency
  const byTable = validations.reduce((acc, v) => {
    if (!acc[v.table]) acc[v.table] = [];
    acc[v.table].push(v.id);
    return acc;
  }, {} as Record<string, string[]>);
  
  await Promise.all(
    Object.entries(byTable).map(async ([table, ids]) => {
      const { data } = await supabase
        .from(table as any)
        .select('id, name')
        .in('id', ids);
      
      const dataArray = ((data || []) as unknown) as Array<{ id: string; name?: string }>;
      const foundIds = new Set(dataArray.map(d => d.id));
      
      ids.forEach(id => {
        const record = dataArray.find(d => d.id === id);
        results.set(id, {
          exists: foundIds.has(id),
          name: record?.name || null,
        });
      });
    })
  );
  
  return results;
};

/**
 * Get a user-friendly message for a missing entity
 */
export const getMissingEntityMessage = (
  entityType: string,
  entityName?: string | null
): { title: string; description: string } => {
  const label = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  
  return {
    title: `${label} no longer available`,
    description: entityName 
      ? `"${entityName}" may have been deleted or deactivated. Please select a different ${entityType}.`
      : `The previously selected ${entityType} may have been deleted or deactivated. Please select a different one.`,
  };
};

/**
 * Filter out stale/deleted IDs from a selection list
 * @param selectedItems - Array of currently selected items with id property
 * @param validItems - Array of valid items from the database
 * @returns Object with valid and stale items separated
 */
export const filterStaleSelections = <T extends { id: string }>(
  selectedItems: T[],
  validItems: { id: string }[]
): { valid: T[]; stale: T[] } => {
  const validIdSet = new Set(validItems.map(i => i.id));
  
  const valid: T[] = [];
  const stale: T[] = [];
  
  selectedItems.forEach(item => {
    if (validIdSet.has(item.id)) {
      valid.push(item);
    } else {
      stale.push(item);
    }
  });
  
  return { valid, stale };
};
