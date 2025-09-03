import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
      console.log('Fetching users...');
      
      // Get the current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.log('No authenticated user found');
        return [];
      }
      
      // Get user profiles from the same account
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

      // Transform profiles to users more efficiently (no async operations needed)
      const users: User[] = uniqueProfiles.map((profile) => {
        let email = 'Protected Email';
        
        // Only show the actual email for the current user for security
        if (profile.user_id === currentUser.id) {
          email = currentUser.email || 'Unknown Email';
        } else {
          // For other users, try to extract from display_name if it looks like an email
          if (profile.display_name && profile.display_name.includes('@')) {
            email = profile.display_name;
          }
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

      console.log('Transformed users:', users);
      return users;
    },
  });
};