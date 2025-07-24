
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface UserPresence {
  id: string;
  user_id: string;
  current_page: string | null;
  current_job_id: string | null;
  last_seen: string;
  is_online: boolean;
  user_profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    status: string | null;
  } | null;
}

export const useUserPresence = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [loading, setLoading] = useState(true);

  // Update current user's presence
  const updatePresence = async (currentPage: string, currentJobId?: string) => {
    if (!user) return;

    console.log('Updating presence:', { currentPage, currentJobId });
    
    const { error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        current_page: currentPage,
        current_job_id: currentJobId,
        last_seen: new Date().toISOString(),
        is_online: true,
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error updating presence:', error);
    }
  };

  // Fetch active users
  const fetchActiveUsers = async () => {
    // First get the presence data
    const { data: presenceData, error: presenceError } = await supabase
      .from('user_presence')
      .select('*')
      .eq('is_online', true)
      .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5 minutes ago

    if (presenceError) {
      console.error('Error fetching active users:', presenceError);
      setActiveUsers([]);
      setLoading(false);
      return;
    }

    // Get unique user IDs from the presence data
    const userIds = presenceData.map(presence => presence.user_id);

    // Fetch user profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, avatar_url, status')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Create a map of user profiles
    const profilesMap = new Map();
    profilesData?.forEach(profile => {
      profilesMap.set(profile.user_id, {
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        status: profile.status
      });
    });

    // Transform the data to match our interface
    const transformedData: UserPresence[] = presenceData.map(item => ({
      id: item.id,
      user_id: item.user_id,
      current_page: item.current_page,
      current_job_id: item.current_job_id,
      last_seen: item.last_seen,
      is_online: item.is_online,
      user_profiles: profilesMap.get(item.user_id) || null
    }));

    setActiveUsers(transformedData);
    setLoading(false);
  };

  // Set user offline
  const setOffline = async () => {
    if (!user) return;
    
    await supabase
      .from('user_presence')
      .update({ is_online: false })
      .eq('user_id', user.id);
  };

  // Update presence when route changes
  useEffect(() => {
    if (user) {
      updatePresence(location.pathname);
    }
  }, [user, location.pathname]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    fetchActiveUsers();

    const channel = supabase
      .channel('user-presence-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_presence' },
        () => {
          fetchActiveUsers();
        }
      )
      .subscribe();

    // Heartbeat to keep presence alive
    const heartbeat = setInterval(() => {
      if (user) {
        updatePresence(location.pathname);
      }
    }, 30000); // 30 seconds

    // Set offline on page unload
    const handleBeforeUnload = () => {
      setOffline();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      supabase.removeChannel(channel);
      setOffline();
    };
  }, [user]);

  return {
    activeUsers,
    loading,
    updatePresence,
    setOffline,
  };
};
