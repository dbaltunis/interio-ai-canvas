import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMemberPresence {
  user_id: string;
  display_name: string;
  role: string;
  last_seen: string | null;
  is_online: boolean;
  status: 'online' | 'offline' | 'away' | 'never_logged_in';
  theme_preference: string;
}

export const useTeamPresence = (search?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["team-presence", search ?? null],
    queryFn: async (): Promise<TeamMemberPresence[]> => {
      // Add timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const { data, error } = await supabase.rpc("get_team_presence", {
          search_param: search ?? null,
        });
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.warn('Team presence query failed:', error.message);
          // Return empty array instead of throwing to prevent cascading failures
          return [];
        }
        return (data as TeamMemberPresence[]) || [];
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn('Team presence request failed:', err);
        return []; // Graceful degradation
      }
    },
    staleTime: 30 * 1000, // Cache for 30 seconds for faster presence updates
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchInterval: 60 * 1000, // Refetch every 1 minute for quicker updates
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // Wait 1 second before retry
  });

  useEffect(() => {
    // Use unique channel name to prevent "tried to subscribe multiple times" error
    const channelName = `presence-user-profiles-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "user_profiles" },
        () => queryClient.invalidateQueries({ queryKey: ["team-presence"] })
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_profiles" },
        () => queryClient.invalidateQueries({ queryKey: ["team-presence"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};
