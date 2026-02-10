import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
import { getEffectiveOwnerForMutation } from "@/utils/getEffectiveOwnerForMutation";
import { useToast } from "@/hooks/use-toast";

export interface CalendarTeamGroup {
  id: string;
  name: string;
  user_id: string;
  member_ids: string[];
  color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useCalendarTeamGroups = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ["calendar-team-groups", effectiveOwnerId],
    queryFn: async (): Promise<CalendarTeamGroup[]> => {
      if (!effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("calendar_team_groups")
        .select("*")
        .eq("user_id", effectiveOwnerId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as CalendarTeamGroup[];
    },
    enabled: !!effectiveOwnerId,
  });
};

export const useCreateTeamGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (group: { name: string; color: string; member_ids: string[]; is_default?: boolean }) => {
      const { effectiveOwnerId } = await getEffectiveOwnerForMutation();
      
      const { data, error } = await supabase
        .from("calendar_team_groups")
        .insert({
          name: group.name,
          color: group.color,
          member_ids: group.member_ids,
          is_default: group.is_default || false,
          user_id: effectiveOwnerId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-team-groups"] });
      toast({ title: "Team group created" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating group", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateTeamGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (group: { id: string; name?: string; color?: string; member_ids?: string[]; is_default?: boolean }) => {
      const { id, ...updates } = group;
      const { data, error } = await supabase
        .from("calendar_team_groups")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-team-groups"] });
      toast({ title: "Team group updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating group", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteTeamGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("calendar_team_groups")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-team-groups"] });
      toast({ title: "Team group deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting group", description: error.message, variant: "destructive" });
    },
  });
};
