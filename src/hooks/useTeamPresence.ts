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
      const { data, error } = await supabase.rpc("get_team_presence", {
        search_param: search ?? null,
      });
      if (error) throw error;
      return (data as TeamMemberPresence[]) || [];
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes - presence doesn't need real-time updates
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus - rely on realtime updates
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes as backup
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
