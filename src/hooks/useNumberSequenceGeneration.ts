import { supabase } from "@/integrations/supabase/client";
import type { EntityType } from "./useNumberSequences";

/**
 * Get the effective account owner ID for multi-tenant queries
 */
const getEffectiveOwnerId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("parent_account_id")
    .eq("user_id", user.id)
    .single();

  return profile?.parent_account_id || user.id;
};

/**
 * Get entity type from status ID by reading from database
 * This replaces the hardcoded English status name mapping
 */
export const getEntityTypeFromStatusId = async (statusId: string): Promise<EntityType | null> => {
  if (!statusId) return null;
  
  const { data: status, error } = await supabase
    .from("job_statuses")
    .select("document_type")
    .eq("id", statusId)
    .single();
  
  if (error || !status) {
    console.error("Error fetching status document_type:", error);
    return 'draft'; // Safe default
  }
  
  return (status.document_type as EntityType) || 'draft';
};

/**
 * Legacy function - maps job status names to number sequence entity types
 * Kept for backward compatibility but now falls back to database lookup
 * @deprecated Use getEntityTypeFromStatusId instead
 */
export const getEntityTypeFromStatus = (statusName: string): EntityType | null => {
  if (!statusName) return null;
  
  const normalized = statusName.toLowerCase().trim();
  
  // Basic English fallbacks for common patterns
  const basicMap: Record<string, EntityType> = {
    'draft': 'draft',
    'new': 'draft',
    'pending': 'draft',
    'quote': 'quote',
    'quoted': 'quote',
    'sent': 'quote',
    'approved': 'order',
    'order': 'order',
    'production': 'order',
    'manufacturing': 'order',
    'completed': 'invoice',
    'invoiced': 'invoice',
    'paid': 'invoice',
    'closed': 'invoice',
  };
  
  // Direct match first
  if (basicMap[normalized]) {
    return basicMap[normalized];
  }
  
  // Partial match fallback
  for (const [key, entityType] of Object.entries(basicMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return entityType;
    }
  }
  
  // Default to draft if no match - but ideally use getEntityTypeFromStatusId
  return 'draft';
};

/**
 * Get the display label for a document based on entity type
 */
export const getDocumentLabel = (entityType: EntityType): string => {
  switch (entityType) {
    case 'draft': return 'Draft';
    case 'quote': return 'Quote';
    case 'order': return 'Order';
    case 'invoice': return 'Invoice';
    case 'job': return 'Job';
    default: return 'Document';
  }
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
    // Get account owner for team members
    const effectiveOwnerId = await getEffectiveOwnerId();
    const ownerId = effectiveOwnerId || userId;
    
    const { data, error } = await supabase.rpc("get_next_sequence_number", {
      p_user_id: ownerId,
      p_entity_type: entityType,
    });
    
    if (error) {
      console.error(`Error generating ${entityType} number:`, error);
      // Try fallback to first active sequence
      return await getFallbackSequenceNumber(ownerId, fallbackPrefix);
    }
    
    if (!data) {
      // Sequence might be inactive - try fallback
      console.warn(`No ${entityType} sequence found or inactive, trying fallback`);
      return await getFallbackSequenceNumber(ownerId, fallbackPrefix);
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to generate ${entityType} number:`, error);
    // Last resort fallback
    return `${fallbackPrefix}-${Date.now()}`;
  }
};

/**
 * Fallback: Get a number from any active sequence
 */
const getFallbackSequenceNumber = async (
  userId: string,
  fallbackPrefix: string
): Promise<string> => {
  // Try each entity type in order of preference
  const fallbackOrder: EntityType[] = ['draft', 'quote', 'order', 'invoice', 'job'];
  
  for (const entityType of fallbackOrder) {
    const { data } = await supabase.rpc("get_next_sequence_number", {
      p_user_id: userId,
      p_entity_type: entityType,
    });
    
    if (data) {
      console.log(`Using fallback sequence from ${entityType}: ${data}`);
      return data;
    }
  }
  
  // Absolute last resort
  console.error("No active sequences found, using timestamp");
  return `${fallbackPrefix}-${Date.now()}`;
};

/**
 * Determines if a new number should be generated when status changes
 * Now uses status IDs instead of names for accuracy
 */
export const shouldRegenerateNumberByIds = async (
  oldStatusId: string | null,
  newStatusId: string
): Promise<boolean> => {
  if (!oldStatusId || !newStatusId) return false;
  if (oldStatusId === newStatusId) return false;
  
  const [oldEntityType, newEntityType] = await Promise.all([
    getEntityTypeFromStatusId(oldStatusId),
    getEntityTypeFromStatusId(newStatusId),
  ]);
  
  // Regenerate if entity types differ
  return oldEntityType !== newEntityType && newEntityType !== null;
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use shouldRegenerateNumberByIds instead
 */
export const shouldRegenerateNumber = (
  oldStatusName: string,
  newStatusName: string
): boolean => {
  const oldEntityType = getEntityTypeFromStatus(oldStatusName);
  const newEntityType = getEntityTypeFromStatus(newStatusName);
  
  // Regenerate if entity types differ (works both forward and backward)
  return oldEntityType !== newEntityType && newEntityType !== null;
};

/**
 * Sync the sequence counter if a higher number is manually entered.
 * Extracts the numeric part from the document number and updates the sequence.
 */
export const syncSequenceCounter = async (
  entityType: EntityType,
  documentNumber: string
): Promise<void> => {
  try {
    const effectiveOwnerId = await getEffectiveOwnerId();
    if (!effectiveOwnerId) return;

    // Extract numeric part from the document number
    const numericMatch = documentNumber.match(/(\d+)$/);
    if (!numericMatch) return;

    const enteredNumber = parseInt(numericMatch[1], 10);
    if (isNaN(enteredNumber)) return;

    // Get current sequence using effective owner ID
    const { data: sequence, error: fetchError } = await supabase
      .from("number_sequences")
      .select("*")
      .eq("user_id", effectiveOwnerId)
      .eq("entity_type", entityType)
      .eq("active", true)
      .maybeSingle();

    if (fetchError || !sequence) return;

    // Only update if entered number is >= current next_number
    if (enteredNumber >= sequence.next_number) {
      const { error: updateError } = await supabase
        .from("number_sequences")
        .update({ next_number: enteredNumber + 1 })
        .eq("id", sequence.id);

      if (updateError) {
        console.error("Error syncing sequence counter:", updateError);
      } else {
        console.log(`Synced ${entityType} sequence to ${enteredNumber + 1}`);
      }
    }
  } catch (error) {
    console.error("Error in syncSequenceCounter:", error);
  }
};
