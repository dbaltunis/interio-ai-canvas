import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Hook to check if the current user is a Dealer
 * Uses a secure server-side function to avoid RLS issues
 */
export const useIsDealer = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["isDealer", user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase.rpc("is_dealer", {
        _user_id: user.id,
      });

      if (error) {
        console.error("Error checking dealer status:", error);
        // Throw to trigger React Query retry instead of returning false
        throw error;
      }

      return data === true;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
