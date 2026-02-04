import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get the effective account owner ID for multi-tenant queries.
 * For team members (users with parent_account_id), returns the parent account owner's ID.
 * For account owners (no parent_account_id), returns their own ID.
 * 
 * This ensures team members see the same data as their account owner.
 */
export const useEffectiveAccountOwner = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['effective-account-owner'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { effectiveOwnerId: null, currentUserId: null };
      }

      // Get user profile to check for parent_account_id
      // Using maybeSingle() to gracefully handle missing profiles for new users
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("parent_account_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.warn('[useEffectiveAccountOwner] Error fetching profile, using user.id as fallback:', error);
        return { effectiveOwnerId: user.id, currentUserId: user.id };
      }

      // Handle case where profile doesn't exist yet (new user, trigger may be pending)
      if (!profile) {
        console.warn('[useEffectiveAccountOwner] No profile found for user, using user.id as fallback');
        return { effectiveOwnerId: user.id, currentUserId: user.id };
      }

      // Use parent_account_id if exists (team member), otherwise use own ID (account owner)
      const ownerId = profile?.parent_account_id || user.id;
      console.log('[useEffectiveAccountOwner] Resolved:', {
        currentUserId: user.id,
        parentAccountId: profile?.parent_account_id,
        effectiveOwnerId: ownerId,
        isTeamMember: !!profile?.parent_account_id
      });

      return { effectiveOwnerId: ownerId, currentUserId: user.id };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  return {
    effectiveOwnerId: data?.effectiveOwnerId ?? null,
    currentUserId: data?.currentUserId ?? null,
    isLoading
  };
};
