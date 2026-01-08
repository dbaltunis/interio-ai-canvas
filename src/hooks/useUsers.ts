import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  avatar_url?: string;
}

export const useUsers = () => {
  const { effectiveOwnerId, currentUserId, isLoading: ownerLoading } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ["users", effectiveOwnerId],
    queryFn: async (): Promise<User[]> => {
      if (!effectiveOwnerId || !currentUserId) return [];
      console.log('[useUsers] Fetching users for account:', effectiveOwnerId);
      
      // Get user profiles - only from this account (owner + their team members)
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          display_name,
          role,
          is_active,
          phone_number,
          avatar_url,
          created_at,
          parent_account_id
        `)
        .or(`user_id.eq.${effectiveOwnerId},parent_account_id.eq.${effectiveOwnerId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user profiles:', error);
        throw error;
      }

      console.log('Raw profiles data:', profiles);

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found');
        return [];
      }

      // Filter out duplicate or invalid profiles
      const uniqueProfiles = profiles.filter((profile, index, arr) => 
        profile.user_id && 
        profile.display_name && 
        profile.display_name !== 'test@test.com' &&
        arr.findIndex(p => p.user_id === profile.user_id) === index
      );

      // Transform profiles to users
      const users: User[] = uniqueProfiles.map((profile) => {
        let email = 'Protected Email';
        
        // Show actual email for current user, otherwise mask it
        if (profile.user_id === currentUserId) {
          // We don't have direct access to email here, use display_name if it looks like email
          if (profile.display_name && profile.display_name.includes('@')) {
            email = profile.display_name;
          }
        } else if (profile.display_name && profile.display_name.includes('@')) {
          email = profile.display_name;
        }
        
        return {
          id: profile.user_id,
          name: profile.display_name || 'Unknown User',
          email,
          role: profile.role || 'Staff',
          status: profile.is_active ? 'Active' : 'Inactive',
          phone: profile.phone_number || '',
          avatar_url: profile.avatar_url || null
        };
      });

      console.log('[useUsers] Transformed users:', users);
      return users;
    },
    enabled: !!effectiveOwnerId && !ownerLoading,
  });
};