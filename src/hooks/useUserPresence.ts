import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import type { RealtimeChannel } from '@supabase/supabase-js';

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
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

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
    const { data: presenceData, error: presenceError } = await supabase
      .from('user_presence')
      .select('*')
      .eq('is_online', true)
      .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    if (presenceError) {
      console.error('Error fetching active users:', presenceError);
      setActiveUsers([]);
      setLoading(false);
      return;
    }

    const userIds = presenceData.map(presence => presence.user_id);

    let profilesData = [];
    if (userIds.length > 0) {
      const { data, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, avatar_url, status')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else {
        profilesData = data || [];
      }
    }

    const profilesMap = new Map();
    profilesData.forEach(profile => {
      profilesMap.set(profile.user_id, {
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        status: profile.status
      });
    });

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
    if (user && isInitialized.current) {
      updatePresence(location.pathname);
    }
  }, [user, location.pathname]);

  // Clean up existing resources
  const cleanup = () => {
    if (channelRef.current) {
      console.log('Cleaning up presence channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!user || isInitialized.current) return;

    console.log('Setting up presence subscription for user:', user.id);
    
    // Clean up any existing resources
    cleanup();

    // Initial presence update and fetch
    updatePresence(location.pathname);
    fetchActiveUsers();

    // Create new channel with unique name
    const channelName = `user-presence-${user.id}-${Date.now()}`;
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_presence' },
        () => {
          console.log('Presence change detected');
          fetchActiveUsers();
        }
      )
      .subscribe((status) => {
        console.log('Presence subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isInitialized.current = true;
        }
      });

    // Heartbeat to keep presence alive
    heartbeatRef.current = setInterval(() => {
      if (user && isInitialized.current) {
        updatePresence(location.pathname);
      }
    }, 30000);

    // Set offline on page unload
    const handleBeforeUnload = () => {
      setOffline();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      console.log('Cleaning up presence subscription');
      cleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setOffline();
      isInitialized.current = false;
    };
  }, [user?.id]);

  return {
    activeUsers,
    loading,
    updatePresence,
    setOffline,
  };
};
