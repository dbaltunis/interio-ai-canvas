import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
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
      
      // Get user profiles with a function that can access auth.users emails
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          display_name,
          role,
          is_active,
          phone_number
        `);

      if (error) {
        console.error('Error fetching user profiles:', error);
        throw error;
      }

      console.log('Raw profiles data:', profiles);

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found, creating current user entry');
        // If no profiles exist, at least show the current user
        return [{
          id: currentUser.id,
          name: currentUser.email?.split('@')[0] || 'Current User',
          email: currentUser.email || 'Unknown Email',
          role: 'Admin',
          status: 'Active',
          phone: undefined
        }];
      }

      // Get emails for each profile using the get_user_email function
      const usersWithEmails = await Promise.all(
        profiles.map(async (profile) => {
          try {
            // Try to get email using the function, fallback to current user email if it's the same user
            let email = 'Unknown Email';
            if (profile.user_id === currentUser.id) {
              email = currentUser.email || 'Unknown Email';
            } else {
              // For other users, we'll need to use a different approach since we can't access auth.users directly
              // For now, show as unknown email for security
              email = 'Protected Email';
            }
            
            return {
              id: profile.user_id,
              name: profile.display_name || 'Unknown User',
              email,
              role: profile.role || 'Staff',
              status: profile.is_active ? 'Active' : 'Inactive',
              phone: profile.phone_number || undefined
            };
          } catch (err) {
            console.error('Error getting email for user:', profile.user_id, err);
            return {
              id: profile.user_id,
              name: profile.display_name || 'Unknown User',
              email: profile.user_id === currentUser.id ? currentUser.email || 'Unknown Email' : 'Protected Email',
              role: profile.role || 'Staff',
              status: profile.is_active ? 'Active' : 'Inactive',
              phone: profile.phone_number || undefined
            };
          }
        })
      );

      console.log('Transformed users:', usersWithEmails);
      return usersWithEmails;
    },
  });
};