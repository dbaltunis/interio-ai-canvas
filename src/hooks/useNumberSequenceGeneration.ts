import { supabase } from "@/integrations/supabase/client";
import type { EntityType } from "./useNumberSequences";

/**
 * Maps job status names to number sequence entity types
 */
export const getEntityTypeFromStatus = (statusName: string): EntityType | null => {
  const name = statusName.toLowerCase();
  
  if (name.includes('draft')) return 'draft';
  if (name.includes('quote') || name.includes('approved') || name.includes('rejected')) return 'quote';
  if (name.includes('order') || name.includes('planning')) return 'order';
  if (name.includes('production') || name.includes('review') || name.includes('completed')) return 'invoice';
  
  return null;
};

/**
 * Generates a new number based on entity type
 */
export const generateSequenceNumber = async (
  userId: string,
  entityType: EntityType,
  fallbackPrefix: string = 'NUM'
): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc("get_next_sequence_number", {
      p_user_id: userId,
      p_entity_type: entityType,
    });
    
    if (error) {
      console.error(`Error generating ${entityType} number:`, error);
      return `${fallbackPrefix}-${Date.now()}`;
    }
    
    return data || `${fallbackPrefix}-${Date.now()}`;
  } catch (error) {
    console.error(`Failed to generate ${entityType} number:`, error);
    return `${fallbackPrefix}-${Date.now()}`;
  }
};

/**
 * Determines if a new number should be generated when status changes
 */
export const shouldRegenerateNumber = (
  oldStatusName: string,
  newStatusName: string
): boolean => {
  const oldEntityType = getEntityTypeFromStatus(oldStatusName);
  const newEntityType = getEntityTypeFromStatus(newStatusName);
  
  // Only regenerate if the entity type actually changes
  return oldEntityType !== newEntityType && newEntityType !== null;
};
