
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
  };
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
    const { data, error } = await supabase
      .from('user_presence')
      .select(`
        *,
        user_profiles!user_presence_user_id_fkey (
          display_name,
          avatar_url,
          status
        )
      `)
      .eq('is_online', true)
      .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5 minutes ago

    if (error) {
      console.error('Error fetching active users:', error);
    } else {
      setActiveUsers(data || []);
    }
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
