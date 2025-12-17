import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get the effective account owner ID for multi-tenant queries.
 * For team members (users with parent_account_id), returns the parent account owner's ID.
 * For account owners (no parent_account_id), returns their own ID.
 * 
 * This ensures team members see the same data as their account owner.
 */
export const useEffectiveAccountOwner = () => {
  const [effectiveOwnerId, setEffectiveOwnerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEffectiveOwner = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setEffectiveOwnerId(null);
          setCurrentUserId(null);
          setIsLoading(false);
          return;
        }

        setCurrentUserId(user.id);

        // Get user profile to check for parent_account_id
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("parent_account_id")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.warn('[useEffectiveAccountOwner] Error fetching profile, using user.id as fallback:', error);
          setEffectiveOwnerId(user.id);
        } else {
          // Use parent_account_id if exists (team member), otherwise use own ID (account owner)
          const ownerId = profile?.parent_account_id || user.id;
          console.log('[useEffectiveAccountOwner] Resolved:', {
            currentUserId: user.id,
            parentAccountId: profile?.parent_account_id,
            effectiveOwnerId: ownerId,
            isTeamMember: !!profile?.parent_account_id
          });
          setEffectiveOwnerId(ownerId);
        }
      } catch (err) {
        console.error('[useEffectiveAccountOwner] Unexpected error:', err);
        setEffectiveOwnerId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEffectiveOwner();
  }, []);

  return { effectiveOwnerId, currentUserId, isLoading };
};
