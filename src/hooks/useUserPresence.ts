import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface UserPresence {
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
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

  // Get all active users
  const { data: activeUsers = [], isLoading } = useQuery({
    queryKey: ['user-presence'],
    queryFn: async (): Promise<UserPresence[]> => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          display_name,
          avatar_url,
          role,
          status,
          status_message,
          updated_at
        `)
        .eq('is_active', true);

      if (error) throw error;

      return data.map(profile => ({
        user_id: profile.user_id,
        status: profile.status === 'available' ? 'online' : 'offline',
        last_seen: profile.updated_at,
        user_profile: {
          display_name: profile.display_name || 'Unknown User',
          avatar_url: profile.avatar_url,
          role: profile.role
        }
      }));
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update current user's presence
  const updatePresenceMutation = useMutation({
    mutationFn: async ({ status, currentPage, activity }: {
      status: UserPresence['status'];
      currentPage?: string;
      activity?: string;
    }) => {
      if (!user) return;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          status: status === 'online' ? 'available' : status,
          status_message: activity,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-presence'] });
    }
  });

  // Set user online when component mounts
  useEffect(() => {
    if (user) {
      updatePresenceMutation.mutate({ status: 'online' });

      // Set user offline when page unloads
      const handleBeforeUnload = () => {
        // Use a simple approach since we can't access private supabase properties
        updatePresenceMutation.mutate({ status: 'offline' });
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
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
  }, [window.location.pathname, user]);

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