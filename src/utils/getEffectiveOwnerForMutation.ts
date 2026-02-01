import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves the effective account owner ID for multi-tenant data mutations.
 * 
 * This is CRITICAL for team member support:
 * - If user is an account owner (no parent_account_id), returns their own ID
 * - If user is a team member (has parent_account_id), returns the parent account's ID
 * 
 * This ensures all data created by team members is properly scoped to
 * the account owner and visible to the entire team.
 * 
 * @returns Object containing effectiveOwnerId and currentUserId
 * @throws Error if user is not authenticated
 */
export const getEffectiveOwnerForMutation = async (): Promise<{
  effectiveOwnerId: string;
  currentUserId: string;
}> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("parent_account_id")
    .eq("user_id", user.id)
    .single();

  return {
    effectiveOwnerId: profile?.parent_account_id || user.id,
    currentUserId: user.id
  };
};
