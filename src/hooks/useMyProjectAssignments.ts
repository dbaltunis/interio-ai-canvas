import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Hook to fetch all project IDs that the current user is assigned to.
 * Used for filtering visible jobs in JobsPage and access checks in JobDetailPage.
 */
export const useMyProjectAssignments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-project-assignments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("project_assignments")
        .select("project_id")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) {
        console.error("[useMyProjectAssignments] Error fetching assignments:", error);
        throw error;
      }

      return data?.map(a => a.project_id) || [];
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });
};
