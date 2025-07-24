
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface UserPresence {
  user_id: string;
  current_page: string;
  is_online: boolean;
  last_seen: string;
  current_job_id?: string;
}

interface UserProfile {
  user_id: string;
  display_name: string;
  avatar_url?: string;
}

interface ActiveUser extends UserPresence {
  profile?: UserProfile;
}

export const useUserPresence = (currentPage: string = '/') => {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const presenceUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const fetchIntervalRef = useRef<NodeJS.Timeout>();

  // Update user's presence in the database
  const updatePresence = async (page: string, online: boolean = true) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          current_page: page,
          is_online: online,
          last_seen: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating presence:', error);
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  // Debounced presence update
  const debouncedUpdatePresence = (page: string, online: boolean = true) => {
    if (presenceUpdateTimeoutRef.current) {
      clearTimeout(presenceUpdateTimeoutRef.current);
    }

    presenceUpdateTimeoutRef.current = setTimeout(() => {
      updatePresence(page, online);
    }, 1000);
  };

  // Fetch active users with their profiles
  const fetchActiveUsers = async () => {
    try {
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('*')
        .eq('is_online', true)
        .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Active in last 5 minutes

      if (presenceError) {
        console.error('Error fetching presence:', presenceError);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('user_id', presenceData?.map(p => p.user_id) || []);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      const usersWithProfiles = presenceData?.map(presence => ({
        ...presence,
        profile: profilesData?.find(profile => profile.user_id === presence.user_id)
      })) || [];

      setActiveUsers(usersWithProfiles);
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  // Set up presence tracking
  useEffect(() => {
    if (!user) return;

    // Update initial presence
    updatePresence(currentPage);

    // Initial fetch
    fetchActiveUsers();

    // Set up periodic presence updates and fetching
    const presenceInterval = setInterval(() => {
      updatePresence(currentPage);
    }, 60000); // Update every minute

    fetchIntervalRef.current = setInterval(() => {
      fetchActiveUsers();
    }, 30000); // Fetch active users every 30 seconds

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      const online = !document.hidden;
      setIsOnline(online);
      updatePresence(currentPage, online);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(presenceInterval);
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
      if (presenceUpdateTimeoutRef.current) {
        clearTimeout(presenceUpdateTimeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Set user offline on cleanup
      if (user) {
        updatePresence(currentPage, false);
      }
    };
  }, [user, currentPage]);

  // Update presence when page changes
  useEffect(() => {
    if (user && isOnline) {
      debouncedUpdatePresence(currentPage);
    }
  }, [currentPage, user, isOnline]);

  return {
    activeUsers,
    isOnline,
    updatePresence: debouncedUpdatePresence
  };
};
