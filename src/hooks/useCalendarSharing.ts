import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CalendarShare {
  id: string;
  calendar_id: string;
  owner_id: string;
  shared_with_user_id: string;
  permission_level: 'view' | 'edit';
  created_at: string;
  updated_at: string;
}

interface AppointmentShare {
  id: string;
  appointment_id: string;
  owner_id: string;
  shared_with_user_id: string;
  permission_level: 'view' | 'edit';
  created_at: string;
  updated_at: string;
}

interface TeamWorkspace {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export const useCalendarShares = () => {
  return useQuery({
    queryKey: ["calendar-shares"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_shares")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CalendarShare[];
    },
  });
};

export const useAppointmentShares = () => {
  return useQuery({
    queryKey: ["appointment-shares"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointment_shares")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AppointmentShare[];
    },
  });
};

export const useTeamWorkspaces = () => {
  return useQuery({
    queryKey: ["team-workspaces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_workspaces")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TeamWorkspace[];
    },
  });
};

export const useWorkspaceMembers = (workspaceId: string | null) => {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      const { data, error } = await supabase
        .from("workspace_members")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("joined_at", { ascending: false });

      if (error) throw error;
      return data as WorkspaceMember[];
    },
    enabled: !!workspaceId,
  });
};

export const useShareCalendar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      calendarId, 
      sharedWithUserId, 
      permissionLevel = 'view' 
    }: { 
      calendarId: string; 
      sharedWithUserId: string; 
      permissionLevel?: 'view' | 'edit';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("calendar_shares")
        .insert({
          calendar_id: calendarId,
          owner_id: user.id,
          shared_with_user_id: sharedWithUserId,
          permission_level: permissionLevel,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-shares"] });
      toast.success("Calendar shared successfully");
    },
    onError: (error) => {
      toast.error("Failed to share calendar: " + error.message);
    },
  });
};

export const useShareAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      appointmentId, 
      sharedWithUserId, 
      permissionLevel = 'view' 
    }: { 
      appointmentId: string; 
      sharedWithUserId: string; 
      permissionLevel?: 'view' | 'edit';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("appointment_shares")
        .insert({
          appointment_id: appointmentId,
          owner_id: user.id,
          shared_with_user_id: sharedWithUserId,
          permission_level: permissionLevel,
        })
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

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("team_workspaces")
        .insert({
          name,
          description,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-workspaces"] });
      toast.success("Workspace created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create workspace: " + error.message);
    },
  });
};

export const useAddWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      workspaceId, 
      userId, 
      role = 'member' 
    }: { 
      workspaceId: string; 
      userId: string; 
      role?: 'owner' | 'admin' | 'member';
    }) => {
      const { data, error } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          role,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", variables.workspaceId] });
      toast.success("Member added to workspace");
    },
    onError: (error) => {
      toast.error("Failed to add member: " + error.message);
    },
  });
};

export const useRemoveCalendarShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareId: string) => {
      const { error } = await supabase
        .from("calendar_shares")
        .delete()
        .eq("id", shareId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-shares"] });
      toast.success("Calendar share removed");
    },
    onError: (error) => {
      toast.error("Failed to remove calendar share: " + error.message);
    },
  });
};

export const useRemoveAppointmentShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareId: string) => {
      const { error } = await supabase
        .from("appointment_shares")
        .delete()
        .eq("id", shareId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-shares"] });
      toast.success("Appointment share removed");
    },
    onError: (error) => {
      toast.error("Failed to remove appointment share: " + error.message);
    },
  });
};