import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_PERMISSIONS } from "@/constants/permissions";

export interface TeamMemberWithPermissions {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  hasViewAllJobs: boolean;
  hasViewAssignedJobs: boolean;
}

export interface TeamMembersWithPermissionsResult {
  allMembers: TeamMemberWithPermissions[];
  fullAccessMembers: TeamMemberWithPermissions[]; // Users with view_all_jobs
  needsAssignmentMembers: TeamMemberWithPermissions[]; // Users with only view_assigned_jobs
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch team members with their job viewing permissions.
 * 
 * This hook categorizes team members into two groups:
 * 1. Full Access - Users with view_all_jobs permission (can see all jobs automatically)
 * 2. Needs Assignment - Users with only view_assigned_jobs (can only see jobs they're assigned to)
 * 
 * @param excludeUserId - Optional user ID to exclude (typically the project owner)
 */
export const useTeamMembersWithJobPermissions = (excludeUserId?: string) => {
  return useQuery({
    queryKey: ["team-members-with-job-permissions", excludeUserId],
    queryFn: async (): Promise<TeamMembersWithPermissionsResult> => {
      // Get current user to resolve account scope
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          allMembers: [],
          fullAccessMembers: [],
          needsAssignmentMembers: [],
          isLoading: false,
          error: null,
        };
      }

      // Get current user's profile to determine account owner
      const { data: currentProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("user_id, parent_account_id")
        .eq("user_id", user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[useTeamMembersWithJobPermissions] Error fetching current user profile:', profileError);
        throw profileError;
      }

      // Determine account owner ID
      const accountOwnerId = currentProfile?.parent_account_id || user.id;

      // Fetch all profiles in the same account
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, role, avatar_url, parent_account_id")
        .or(`user_id.eq.${accountOwnerId},parent_account_id.eq.${accountOwnerId}`)
        .order("display_name", { ascending: true });

      if (profilesError) throw profilesError;
      if (!profiles) {
        return {
          allMembers: [],
          fullAccessMembers: [],
          needsAssignmentMembers: [],
          isLoading: false,
          error: null,
        };
      }

      // Filter out the excluded user (owner) if provided
      const relevantProfiles = profiles.filter(p => 
        p.user_id && 
        p.display_name && 
        (!excludeUserId || p.user_id !== excludeUserId)
      );

      // For each user, determine their job permissions based on their role
      // We use ROLE_PERMISSIONS as the source of truth since that's how the system works
      const membersWithPermissions: TeamMemberWithPermissions[] = relevantProfiles.map(profile => {
        const userRole = profile.role || 'User';
        
        // Get permissions for this role from the centralized permission system
        const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || ['view_profile'];
        
        // Check if user has view_all_jobs or view_assigned_jobs
        const hasViewAllJobs = rolePermissions.includes('view_all_jobs');
        const hasViewAssignedJobs = rolePermissions.includes('view_assigned_jobs');
        
        return {
          id: profile.user_id,
          name: profile.display_name,
          email: profile.user_id === user.id ? (user.email ?? "Hidden") : "Hidden",
          role: userRole,
          avatar_url: profile.avatar_url || undefined,
          hasViewAllJobs,
          hasViewAssignedJobs,
        };
      });

      // Categorize members
      const fullAccessMembers = membersWithPermissions.filter(m => m.hasViewAllJobs);
      const needsAssignmentMembers = membersWithPermissions.filter(m => !m.hasViewAllJobs && m.hasViewAssignedJobs);

      return {
        allMembers: membersWithPermissions,
        fullAccessMembers,
        needsAssignmentMembers,
        isLoading: false,
        error: null,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Simplified hook that just returns the categorized counts and lists
 * Used by TeamAvatarStack to display accurate access information
 */
export const useTeamJobAccessInfo = () => {
  const { data, isLoading, error } = useTeamMembersWithJobPermissions();
  
  return {
    fullAccessCount: data?.fullAccessMembers.length ?? 0,
    needsAssignmentCount: data?.needsAssignmentMembers.length ?? 0,
    totalMembersCount: data?.allMembers.length ?? 0,
    fullAccessMembers: data?.fullAccessMembers ?? [],
    needsAssignmentMembers: data?.needsAssignmentMembers ?? [],
    isLoading,
    error,
  };
};
