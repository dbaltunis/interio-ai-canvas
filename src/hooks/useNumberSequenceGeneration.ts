import { supabase } from "@/integrations/supabase/client";
import type { EntityType } from "./useNumberSequences";

/**
 * Status to entity type mapping - defines which document type each status belongs to
 * This determines the document number prefix (DRAFT-, QUOTE-, ORDER-, INV-)
 */
const STATUS_ENTITY_MAP: Record<string, EntityType> = {
  // Draft stage - initial/planning states
  'draft': 'draft',
  'new': 'draft',
  'pending': 'draft',
  'planning': 'draft',
  
  // Quote stage
  'quote': 'quote',
  'quote sent': 'quote',
  'quoted': 'quote',
  'awaiting approval': 'quote',
  'sent': 'quote',
  'rejected': 'quote',
  'declined': 'quote',
  
  // Order stage (approved quotes become orders)
  'approved': 'order',
  'order': 'order',
  'ordered': 'order',
  'in progress': 'order',
  'in production': 'order',
  'production': 'order',
  'manufacturing': 'order',
  
  // Invoice stage (completed work)
  'completed': 'invoice',
  'invoiced': 'invoice',
  'invoice': 'invoice',
  'paid': 'invoice',
  'closed': 'invoice',
};

/**
 * Maps job status names to number sequence entity types
 */
export const getEntityTypeFromStatus = (statusName: string): EntityType | null => {
  if (!statusName) return null;
  
  const normalized = statusName.toLowerCase().trim();
  
  // Direct match first
  if (STATUS_ENTITY_MAP[normalized]) {
    return STATUS_ENTITY_MAP[normalized];
  }
  
  // Partial match fallback
  for (const [key, entityType] of Object.entries(STATUS_ENTITY_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return entityType;
    }
  }
  
  // Default to draft if no match
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
 * Regenerates when moving between entity types (forward OR backward)
 */
export const shouldRegenerateNumber = (
  oldStatusName: string,
  newStatusName: string
): boolean => {
  const oldEntityType = getEntityTypeFromStatus(oldStatusName);
  const newEntityType = getEntityTypeFromStatus(newStatusName);
  
  // Regenerate if entity types differ (works both forward and backward)
  // AND the new entity type is valid
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Extract numeric part from the document number
    const numericMatch = documentNumber.match(/(\d+)$/);
    if (!numericMatch) return;

    const enteredNumber = parseInt(numericMatch[1], 10);
    if (isNaN(enteredNumber)) return;

    // Get current sequence
    const { data: sequence, error: fetchError } = await supabase
      .from("number_sequences")
      .select("*")
      .eq("user_id", user.id)
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
