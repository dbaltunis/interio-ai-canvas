import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type VideoProvider = 'google_meet' | 'zoom' | 'teams' | 'manual' | null;

export interface VideoProviderStatus {
  provider: VideoProvider;
  connected: boolean;
  name: string;
  icon: string;
}

export const useVideoMeetingProviders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['video-providers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check which providers are connected
      const { data: integrations } = await supabase
        .from('integration_settings')
        .select('integration_type, active')
        .eq('user_id', user.id)
        .in('integration_type', ['google_calendar', 'zoom', 'microsoft_teams']);

      const providerStatuses: VideoProviderStatus[] = [
        {
          provider: 'google_meet',
          connected: integrations?.some(i => i.integration_type === 'google_calendar' && i.active) ?? false,
          name: 'Google Meet',
          icon: '📹'
        },
        {
          provider: 'zoom',
          connected: integrations?.some(i => i.integration_type === 'zoom' && i.active) ?? false,
          name: 'Zoom',
          icon: '🎥'
        },
        {
          provider: 'teams',
          connected: integrations?.some(i => i.integration_type === 'microsoft_teams' && i.active) ?? false,
          name: 'Microsoft Teams',
          icon: '💼'
        },
        {
          provider: 'manual',
          connected: true,
          name: 'Manual Entry',
          icon: '✏️'
        }
      ];

      return providerStatuses;
    }
  });

  const generateMeetingLink = useMutation({
    mutationFn: async ({ 
      appointmentId, 
      provider, 
      title, 
      startTime, 
      endTime, 
      duration 
    }: {
      appointmentId: string;
      provider: VideoProvider;
      title: string;
      startTime: string;
      endTime: string;
      duration?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (provider === 'google_meet') {
        // Google Meet is generated via Calendar sync
        const { data, error } = await supabase.functions.invoke('sync-to-google-calendar', {
          body: { appointmentId }
        });
        if (error) throw error;
        return data;
      } else if (provider === 'zoom') {
        const { data, error } = await supabase.functions.invoke('generate-zoom-meeting', {
          body: { appointmentId, userId: user.id, title, startTime, duration }
        });
        if (error) throw error;
        return data;
      } else if (provider === 'teams') {
        const { data, error } = await supabase.functions.invoke('generate-teams-meeting', {
          body: { appointmentId, userId: user.id, title, startTime, endTime }
        });
        if (error) throw error;
        return data;
      }
      return null;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Meeting link generated",
        description: `${variables.provider === 'google_meet' ? 'Google Meet' : variables.provider === 'zoom' ? 'Zoom' : 'Teams'} link created successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate meeting link",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    providers,
    isLoading,
    generateMeetingLink: generateMeetingLink.mutate,
    isGenerating: generateMeetingLink.isPending
  };
};
