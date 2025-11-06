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
    refetchOnWindowFocus: true,
    refetchInterval: 10_000, // Refetch every 10 seconds for real-time updates
    staleTime: 5_000, // Consider data stale after 5 seconds
  });

  useEffect(() => {
    const channel = supabase
      .channel("presence-user-profiles")
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
