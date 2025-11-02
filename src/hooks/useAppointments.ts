
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Appointment {
  id: string;
  user_id: string;
  client_id?: string;
  project_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  appointment_type?: 'consultation' | 'measurement' | 'installation' | 'follow-up' | 'reminder' | 'meeting' | 'call';
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  color?: string;
  video_meeting_link?: string;
  team_member_ids?: string[];
  invited_client_emails?: string[];
  notification_enabled?: boolean;
  notification_minutes?: number;
  visibility?: 'private' | 'team' | 'organization';
  shared_with_organization?: boolean;
  created_at: string;
  updated_at: string;
}

export const useAppointments = () => {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      // Filter out any invalid appointments (just in case)
      const validAppointments = (data as Appointment[]).filter(appointment => {
        const startTime = new Date(appointment.start_time);
        const endTime = new Date(appointment.end_time);
        return !isNaN(startTime.getTime()) && !isNaN(endTime.getTime()) && endTime > startTime;
      });
      
      return validAppointments;
    },
    // Reduce cache time to ensure fresh data
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (appointmentData: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });

      // Auto-sync to Google Calendar
      try {
        const { data: integration } = await supabase
          .from('integration_settings')
          .select('active')
          .eq('user_id', data.user_id)
          .eq('integration_type', 'google_calendar')
          .single();

        if (integration?.active) {
          toast({
            title: "Syncing...",
            description: "Syncing to Google Calendar",
          });

          const { error: syncError } = await supabase.functions.invoke('sync-to-google-calendar', {
            body: { appointmentId: data.id }
          });

          if (syncError) {
            console.error('Sync error:', syncError);
            toast({
              title: "Sync Failed",
              description: "Created appointment but failed to sync to Google Calendar. You can manually sync later.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Synced!",
              description: "Appointment synced to Google Calendar",
            });
          }
        }
      } catch (error) {
        console.error('Auto-sync error:', error);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Appointment> & { id: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });

      // Auto-sync to Google Calendar if appointment details changed
      const timeFieldsChanged = variables.start_time || variables.end_time || variables.title || variables.description || variables.location;
      
      if (timeFieldsChanged) {
        try {
          const { data: integration } = await supabase
            .from('integration_settings')
            .select('active')
            .eq('user_id', data.user_id)
            .eq('integration_type', 'google_calendar')
            .single();

          if (integration?.active) {
            toast({
              title: "Syncing...",
              description: "Updating Google Calendar",
            });

            const { error: syncError } = await supabase.functions.invoke('sync-to-google-calendar', {
              body: { appointmentId: data.id }
            });

            if (syncError) {
              console.error('Sync error:', syncError);
              toast({
                title: "Sync Failed",
                description: "Updated appointment but failed to sync to Google Calendar",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Synced!",
                description: "Changes synced to Google Calendar",
              });
            }
          }
        } catch (error) {
          console.error('Auto-sync error:', error);
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    },
  });
};
