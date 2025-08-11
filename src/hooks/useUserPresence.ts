
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface UserPresence {
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline' | 'never_logged_in';
  last_seen: string;
  current_page?: string;
  current_activity?: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
    role: string;
  };
}

export const useUserPresence = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<string>('');

  // Get all active users with real presence data, including current user
  const { data: activeUsers = [], isLoading } = useQuery({
    queryKey: ['user-presence'],
    queryFn: async (): Promise<UserPresence[]> => {
      const { data, error } = await supabase
        .from('user_presence_view')
        .select('*');

      if (error) throw error;

      return data.map(profile => ({
        user_id: profile.user_id,
        status: profile.user_id === user?.id ? 'online' : profile.status as 'online' | 'away' | 'busy' | 'offline' | 'never_logged_in',
        last_seen: profile.last_seen,
        user_profile: {
          display_name: profile.display_name || 'Unknown User',
          avatar_url: profile.avatar_url,
          role: profile.role
        },
        current_activity: profile.status_message
      }));
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update current user's presence using the new database functions
  const updatePresenceMutation = useMutation({
    mutationFn: async ({ status, currentPage, activity }: {
      status: UserPresence['status'];
      currentPage?: string;
      activity?: string;
    }) => {
      if (!user) return;

      if (status === 'online') {
        // Call the database function to update last seen and mark online
        const { error } = await supabase.rpc('update_user_last_seen', {
          user_id: user.id
        });
        if (error) throw error;

        // Update status message if provided
        if (activity) {
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ status_message: activity })
            .eq('user_id', user.id);
          if (updateError) throw updateError;
        }
      } else {
        // Mark user as offline
        const { error } = await supabase.rpc('mark_user_offline', {
          user_id: user.id
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-presence'] });
    }
  });

  // Set user online when component mounts and track activity properly
  useEffect(() => {
    if (user) {
      updatePresenceMutation.mutate({ status: 'online' });

      // Keep updating user activity every 30 seconds while active
      const activityInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          updatePresenceMutation.mutate({ status: 'online' });
        }
      }, 30000);

      // Handle tab visibility changes to set online/offline more reliably
      const onVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          updatePresenceMutation.mutate({ status: 'offline' });
        } else {
          updatePresenceMutation.mutate({ status: 'online' });
        }
      };

      document.addEventListener('visibilitychange', onVisibilityChange);

      // Attempt to mark user offline before unload (may not always complete)
      const handleBeforeUnload = () => {
        updatePresenceMutation.mutate({ status: 'offline' });
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        clearInterval(activityInterval);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updatePresenceMutation.mutate({ status: 'offline' });
      };
    }
  }, [user]);

  // Track page changes
  useEffect(() => {
    const path = window.location.pathname;
    setCurrentPage(path);
    
    if (user && path !== currentPage) {
      updatePresenceMutation.mutate({ 
        status: 'online', 
        currentPage: path,
        activity: getActivityFromPath(path)
      });
    }
  }, [user, currentPage]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channelName = `user-presence-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['user-presence'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user]);

  const updateStatus = (status: UserPresence['status'], activity?: string) => {
    updatePresenceMutation.mutate({ status, activity });
  };

  const updateActivity = (activity: string) => {
    updatePresenceMutation.mutate({ status: 'online', activity });
  };

  return {
    activeUsers,
    isLoading,
    updateStatus,
    updateActivity,
    currentUser: user ? activeUsers.find(u => u.user_id === user.id) : null
  };
};

// Helper function to convert path to activity
const getActivityFromPath = (path: string): string => {
  const pathMap: Record<string, string> = {
    '/': 'Dashboard',
    '/clients': 'Managing Clients',
    '/jobs': 'Working on Jobs',
    '/calendar': 'Viewing Calendar',
    '/inventory': 'Managing Inventory',
    '/analytics': 'Viewing Analytics',
    '/settings': 'In Settings'
  };

  return pathMap[path] || `Viewing ${path.split('/')[1] || 'Dashboard'}`;
};
