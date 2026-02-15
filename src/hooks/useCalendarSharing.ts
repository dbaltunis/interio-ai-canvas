import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CalendarDelegation {
  id: string;
  owner_id: string;
  delegate_id: string;
  permission_level: 'view' | 'edit' | 'manage';
  granted_by: string | null;
  created_at: string;
  updated_at: string;
}

interface AppointmentShare {
  id: string;
  appointment_id: string;
  owner_id: string;
  shared_with_user_id: string;
  permission_level: 'view' | 'edit' | 'manage';
  created_at: string;
  updated_at: string;
}

// ---- Calendar Delegation (who can see/edit whose full calendar) ----

export const useCalendarDelegations = () => {
  return useQuery({
    queryKey: ["calendar-delegations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_delegations" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Table may not exist yet if migration hasn't run
        console.warn("Calendar delegations query failed:", error.message);
        return [];
      }
      return (data || []) as CalendarDelegation[];
    },
  });
};

// Backward-compatible alias
export const useCalendarShares = () => useCalendarDelegations();

export const useAppointmentShares = (appointmentId?: string) => {
  return useQuery({
    queryKey: ["appointment-shares", appointmentId],
    queryFn: async () => {
      let query = supabase
        .from("appointment_shares" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (appointmentId) {
        query = query.eq("appointment_id", appointmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.warn("Appointment shares query failed:", error.message);
        return [];
      }
      return (data || []) as AppointmentShare[];
    },
  });
};

export const useDelegateCalendar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      delegateUserId,
      permissionLevel = 'view',
    }: {
      delegateUserId: string;
      permissionLevel?: 'view' | 'edit' | 'manage';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("calendar_delegations" as any)
        .upsert({
          owner_id: user.id,
          delegate_id: delegateUserId,
          permission_level: permissionLevel,
          granted_by: user.id,
        }, { onConflict: "owner_id,delegate_id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-delegations"] });
      toast.success("Calendar access granted");
    },
    onError: (error) => {
      toast.error("Failed to delegate calendar: " + error.message);
    },
  });
};

// Backward-compatible alias
export const useShareCalendar = () => {
  const delegate = useDelegateCalendar();
  return {
    ...delegate,
    mutate: ({ calendarId, sharedWithUserId, permissionLevel }: {
      calendarId: string;
      sharedWithUserId: string;
      permissionLevel?: 'view' | 'edit';
    }) => {
      delegate.mutate({
        delegateUserId: sharedWithUserId,
        permissionLevel: permissionLevel || 'view',
      });
    },
  };
};

export const useShareAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      sharedWithUserId,
      permissionLevel = 'view',
    }: {
      appointmentId: string;
      sharedWithUserId: string;
      permissionLevel?: 'view' | 'edit' | 'manage';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("appointment_shares" as any)
        .upsert({
          appointment_id: appointmentId,
          owner_id: user.id,
          shared_with_user_id: sharedWithUserId,
          permission_level: permissionLevel,
        }, { onConflict: "appointment_id,shared_with_user_id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-shares"] });
      toast.success("Appointment shared successfully");
    },
    onError: (error) => {
      toast.error("Failed to share appointment: " + error.message);
    },
  });
};

export const useRemoveCalendarDelegation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (delegationId: string) => {
      const { error } = await supabase
        .from("calendar_delegations" as any)
        .delete()
        .eq("id", delegationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-delegations"] });
      toast.success("Calendar delegation removed");
    },
    onError: (error) => {
      toast.error("Failed to remove delegation: " + error.message);
    },
  });
};

// Backward-compatible alias
export const useRemoveCalendarShare = () => useRemoveCalendarDelegation();

export const useRemoveAppointmentShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareId: string) => {
      const { error } = await supabase
        .from("appointment_shares" as any)
        .delete()
        .eq("id", shareId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-shares"] });
      toast.success("Appointment share removed");
    },
    onError: (error) => {
      toast.error("Failed to remove share: " + error.message);
    },
  });
};

// Workspace hooks — these are not used currently but kept for backward compatibility
export const useTeamWorkspaces = () => {
  return useQuery({
    queryKey: ["team-workspaces"],
    queryFn: async () => [] as any[],
  });
};

export const useWorkspaceMembers = (workspaceId: string | null) => {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => [] as any[],
    enabled: !!workspaceId,
  });
};

export const useCreateWorkspace = () => {
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      throw new Error("Team workspaces are managed through the team settings");
    },
  });
};

export const useAddWorkspaceMember = () => {
  return useMutation({
    mutationFn: async ({ workspaceId, userId, role }: {
      workspaceId: string; userId: string; role?: string;
    }) => {
      throw new Error("Team membership is managed through the team settings");
    },
  });
};
