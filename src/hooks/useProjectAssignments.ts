import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

interface ProjectAssignment {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  assigned_by: string | null;
  assigned_at: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AssignmentWithProfile extends ProjectAssignment {
  profile?: {
    id: string;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
    role: string | null;
  };
}

export const useProjectAssignments = (projectId?: string) => {
  return useQuery({
    queryKey: ["project-assignments", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      // First get the assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from("project_assignments")
        .select("*")
        .eq("project_id", projectId)
        .eq("is_active", true)
        .order("assigned_at", { ascending: false });

      if (assignmentsError) {
        console.error("Error fetching project assignments:", assignmentsError);
        throw assignmentsError;
      }

      if (!assignments || assignments.length === 0) {
        return [];
      }

      // Get user profiles for the assigned users
      const userIds = assignments.map(a => a.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, first_name, last_name, phone_number, role")
        .in("user_id", userIds);

      if (profilesError) {
        console.error("Error fetching user profiles:", profilesError);
      }

      // Combine assignments with profiles
      const assignmentsWithProfiles: AssignmentWithProfile[] = assignments.map(assignment => {
        const profile = profiles?.find(p => p.user_id === assignment.user_id);
        return {
          ...assignment,
          profile: profile ? {
            id: assignment.user_id,
            display_name: profile.display_name || null,
            first_name: profile.first_name || null,
            last_name: profile.last_name || null,
            phone_number: profile.phone_number || null,
            role: profile.role || null,
          } : undefined
        };
      });

      return assignmentsWithProfiles;
    },
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
};

export const useAssignUserToProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
      role = "member",
      notes
    }: {
      projectId: string;
      userId: string;
      role?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("project_assignments")
        .insert({
          project_id: projectId,
          user_id: userId,
          role,
          assigned_by: user.id,
          notes: notes || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error("Error assigning user to project:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-assignments", data.project_id] });
      toast({
        title: "Success",
        description: "Team member assigned to project",
      });
    },
    onError: (error: any) => {
      // Handle unique constraint violation
      if (error.code === "23505") {
        toast({
          title: "Already Assigned",
          description: "This team member is already assigned to this project",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to assign team member",
          variant: "destructive",
        });
      }
    },
  });
};

export const useRemoveUserFromProject = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      projectId,
      userId
    }: {
      projectId: string;
      userId: string;
    }) => {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from("project_assignments")
        .update({ is_active: false })
        .eq("project_id", projectId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error removing user from project:", error);
        throw error;
      }

      return { projectId, userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-assignments", data.projectId] });
      toast({
        title: "Success",
        description: "Team member removed from project",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProjectAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      role,
      notes
    }: {
      id: string;
      role?: string;
      notes?: string;
    }) => {
      const updates: Record<string, any> = {};
      if (role !== undefined) updates.role = role;
      if (notes !== undefined) updates.notes = notes;

      const { data, error } = await supabase
        .from("project_assignments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating project assignment:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-assignments", data.project_id] });
      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update assignment",
        variant: "destructive",
      });
    },
  });
};

// Helper hook to check if current user is assigned to a project
export const useIsUserAssigned = (projectId?: string, userId?: string) => {
  return useQuery({
    queryKey: ["is-user-assigned", projectId, userId],
    queryFn: async () => {
      if (!projectId || !userId) return false;

      const { data, error } = await supabase
        .from("project_assignments")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error checking user assignment:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!projectId && !!userId,
    staleTime: 60 * 1000,
  });
};
