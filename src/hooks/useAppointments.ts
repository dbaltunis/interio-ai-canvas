
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHasPermission } from "@/hooks/usePermissions";

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
  google_event_id?: string;
  outlook_event_id?: string;
  nylas_event_id?: string;
  created_at: string;
  updated_at: string;
}

export const useAppointments = () => {
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewOwnCalendar = useHasPermission('view_own_calendar');
  // Allow fetch if user has EITHER view_calendar OR view_own_calendar
  const hasCalendarAccess = canViewCalendar === true || canViewOwnCalendar === true;

  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return [];

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;

      const validAppointments = (appointments as Appointment[]).filter(appointment => {
        const startTime = new Date(appointment.start_time);
        const endTime = new Date(appointment.end_time);
        return !isNaN(startTime.getTime()) && !isNaN(endTime.getTime()) && endTime > startTime;
      });

      return validAppointments;
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: hasCalendarAccess,
  });
};

/** Notify all relevant parties when an appointment is created/updated (in-app + email) */
async function notifyRelevantParties(
  appointmentData: any,
  appointmentId: string,
  creatorId: string
) {
  const title = appointmentData.title || 'Untitled Event';
  const startTime = appointmentData.start_time
    ? new Date(appointmentData.start_time).toLocaleString()
    : '';
  const actionUrl = `/?tab=calendar&eventId=${appointmentId}`;

  // Dedup guard: check if notifications for this source_id already exist
  try {
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('source_id', appointmentId)
      .eq('source_type', 'appointment')
      .limit(1);
    if (existing && existing.length > 0) {
      console.log('[notifyRelevantParties] Notifications already exist for this appointment, skipping');
      return;
    }
  } catch (err) {
    console.warn('Dedup check failed, proceeding:', err);
  }

  const recipientSet = new Set<string>(); // Track who we're notifying to avoid duplicates
  const notifications: any[] = [];

  // 1. Invited team members
  const teamMemberIds: string[] = appointmentData.team_member_ids || [];
  const membersToNotify = teamMemberIds.filter(id => id !== creatorId);
  for (const memberId of membersToNotify) {
    if (!recipientSet.has(memberId)) {
      recipientSet.add(memberId);
      notifications.push({
        user_id: memberId,
        title: 'New Calendar Event',
        message: `You've been invited to "${title}"${startTime ? ` on ${startTime}` : ''}`,
        type: 'calendar_invite',
        category: 'calendar',
        source_type: 'appointment',
        source_id: appointmentId,
        action_url: actionUrl,
        read: false,
      });
    }
  }

  // 2. Job/project owner — if event is linked to a project, notify the project owner
  if (appointmentData.project_id) {
    try {
      const { data: project } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', appointmentData.project_id)
        .single();
      if (project?.user_id && project.user_id !== creatorId && !recipientSet.has(project.user_id)) {
        recipientSet.add(project.user_id);
        notifications.push({
          user_id: project.user_id,
          title: 'Event Scheduled on Your Job',
          message: `"${title}" was scheduled on your project${startTime ? ` for ${startTime}` : ''}`,
          type: 'info',
          category: 'calendar',
          source_type: 'appointment',
          source_id: appointmentId,
          action_url: actionUrl,
          read: false,
        });
      }
    } catch (err) {
      console.warn('Failed to notify project owner:', err);
    }
  }

  // 3. Account owner — if creator is a team member, notify the account owner
  try {
    const { data: creatorProfile } = await supabase
      .from('user_profiles')
      .select('parent_account_id')
      .eq('user_id', creatorId)
      .single();
    const accountOwnerId = creatorProfile?.parent_account_id;
    if (accountOwnerId && accountOwnerId !== creatorId && !recipientSet.has(accountOwnerId)) {
      recipientSet.add(accountOwnerId);
      notifications.push({
        user_id: accountOwnerId,
        title: 'Team Event Created',
        message: `A team member scheduled "${title}"${startTime ? ` for ${startTime}` : ''}`,
        type: 'info',
        category: 'calendar',
        source_type: 'appointment',
        source_id: appointmentId,
        action_url: actionUrl,
        read: false,
      });
    }
  } catch (err) {
    console.warn('Failed to notify account owner:', err);
  }

  // 4. Creator confirmation — self-notification for records
  if (!recipientSet.has(creatorId)) {
    notifications.push({
      user_id: creatorId,
      title: 'Appointment Scheduled',
      message: `Your event "${title}" has been confirmed${startTime ? ` for ${startTime}` : ''}`,
      type: 'success',
      category: 'calendar',
      source_type: 'appointment',
      source_id: appointmentId,
      action_url: actionUrl,
      read: false,
    });
  }

  // Insert all notifications
  if (notifications.length > 0) {
    try {
      await supabase.from('notifications').insert(notifications);
    } catch (err) {
      console.error('Failed to create in-app notifications:', err);
    }
  }

  // 5. Send email invitations via edge function (non-blocking)
  if (teamMemberIds.length > 0) {
    try {
      supabase.functions.invoke('send-calendar-invite-emails', {
        body: {
          appointmentId,
          teamMemberIds,
          creatorId,
          title,
          startTime: appointmentData.start_time,
          endTime: appointmentData.end_time,
          location: appointmentData.location,
          description: appointmentData.description,
          videoMeetingLink: appointmentData.video_meeting_link,
        },
      }).then(({ error }) => {
        if (error) console.error('Calendar invite email error:', error);
      });
    } catch (err) {
      console.error('Failed to send calendar invite emails:', err);
    }
  }
}

/** Sync to all connected calendars (Google, Outlook, Nylas) */
async function syncToConnectedCalendars(appointmentId: string, userId: string) {
  const { data: integrations } = await supabase
    .from('integration_settings')
    .select('integration_type, active')
    .eq('user_id', userId)
    .in('integration_type', ['google_calendar', 'outlook_calendar', 'nylas_calendar'])
    .eq('active', true);

  const syncPromises: Promise<void>[] = [];

  if (integrations?.some(i => i.integration_type === 'google_calendar')) {
    syncPromises.push(
      supabase.functions.invoke('sync-to-google-calendar', {
        body: { appointmentId }
      }).then(({ error }) => {
        if (error) console.error('Google sync error:', error);
      })
    );
  }

  if (integrations?.some(i => i.integration_type === 'outlook_calendar')) {
    syncPromises.push(
      supabase.functions.invoke('sync-to-outlook-calendar', {
        body: { appointmentId }
      }).then(({ error }) => {
        if (error) console.error('Outlook sync error:', error);
      })
    );
  }

  if (integrations?.some(i => i.integration_type === 'nylas_calendar')) {
    syncPromises.push(
      supabase.functions.invoke('nylas-sync-calendar', {
        body: { userId, direction: 'to' }
      }).then(({ error }) => {
        if (error) console.error('Nylas sync error:', error);
      })
    );
  }

  return syncPromises;
}

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (appointmentData: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) throw new Error("No authenticated user");

      const { data: insertData, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return insertData;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });

      // Notify team members added to this event
      notifyRelevantParties(variables, data.id, data.user_id);

      // Auto-sync to all connected calendars (Google + Outlook + Nylas)
      try {
        const syncPromises = await syncToConnectedCalendars(data.id, data.user_id);

        if (syncPromises.length > 0) {
          toast({ title: "Syncing...", description: "Syncing to connected calendars" });
          await Promise.allSettled(syncPromises);
          toast({ title: "Synced!", description: "Appointment synced to your calendars" });
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

      // Notify newly added team members
      if (variables.team_member_ids) {
        notifyRelevantParties(
          { ...data, ...variables },
          data.id,
          data.user_id
        );
      }

      // Auto-sync to connected calendars if appointment details changed
      const timeFieldsChanged = variables.start_time || variables.end_time || variables.title || variables.description || variables.location;

      if (timeFieldsChanged) {
        try {
          const syncPromises = await syncToConnectedCalendars(data.id, data.user_id);

          if (syncPromises.length > 0) {
            toast({ title: "Syncing...", description: "Updating connected calendars" });
            await Promise.allSettled(syncPromises);
            toast({ title: "Synced!", description: "Changes synced to your calendars" });
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
      // First, delete from external calendars BEFORE deleting from DB
      try {
        await supabase.functions.invoke('delete-calendar-event', {
          body: { appointmentId: id }
        });
      } catch (err) {
        console.error('External calendar delete error (non-blocking):', err);
      }

      // Now delete from our database
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
