import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CalendarPreferences {
  id: string;
  user_id: string;
  default_view: string;
  show_organization_events: boolean;
  show_team_events: boolean;
  show_personal_events: boolean;
  default_event_visibility: 'private' | 'team' | 'organization';
  created_at: string;
  updated_at: string;
}

export const useCalendarPreferences = () => {
  return useQuery({
    queryKey: ['calendar-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from('calendar_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Return default preferences if none exist
      if (!data) {
        return {
          show_organization_events: true,
          show_team_events: true,
          show_personal_events: true,
          default_event_visibility: 'private' as const,
          default_view: 'week'
        };
      }

      return data as CalendarPreferences;
    },
  });
};

export const useUpdateCalendarPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<CalendarPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Check if preferences exist
      const { data: existing } = await supabase
        .from('calendar_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('calendar_preferences')
          .update(preferences)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('calendar_preferences')
          .insert({
            user_id: user.id,
            ...preferences
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-preferences'] });
    },
  });
};
