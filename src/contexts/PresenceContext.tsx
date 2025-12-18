import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTeamPresence } from '@/hooks/useTeamPresence';

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
    status_message?: string;
  };
}

interface PresenceContextValue {
  activeUsers: UserPresence[];
  isLoading: boolean;
  updateStatus: (status: UserPresence['status'], activity?: string) => void;
  updateActivity: (activity: string) => void;
  currentUser: UserPresence | null;
}

const PresenceContext = createContext<PresenceContextValue | null>(null);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<string>('');

  // Use cached team presence data with error resilience
  const { data: teamPresence = [], isLoading, error } = useTeamPresence();
  
  // Log presence errors but don't crash the app
  if (error) {
    console.warn('Presence system unavailable:', error);
  }
  
  // Calculate status based on last_seen timestamp
  const calculateStatus = (lastSeen: string | null, userId: string): 'online' | 'away' | 'busy' | 'offline' | 'never_logged_in' => {
    // Current user is always online
    if (userId === user?.id) return 'online';
    
    if (!lastSeen) return 'never_logged_in';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);
    
    if (diffMinutes <= 5) return 'online';      // Active within 5 minutes = green
    if (diffMinutes <= 30) return 'away';       // Active within 30 minutes = yellow
    return 'offline';                            // More than 30 minutes = red/offline
  };

  // Transform team presence data to UserPresence format
  const activeUsers: UserPresence[] = teamPresence.map(profile => ({
    user_id: profile.user_id,
    status: calculateStatus(profile.last_seen, profile.user_id),
    last_seen: profile.last_seen || new Date().toISOString(),
    user_profile: {
      display_name: profile.display_name || 'Unknown User',
      avatar_url: undefined,
      role: profile.role,
      status_message: undefined
    },
    current_activity: undefined
  }));

  // Single mutation with identifiable key for filtering in SyncIndicator
  const updatePresenceMutation = useMutation({
    mutationKey: ['presence'], // This allows filtering in SyncIndicator
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
      queryClient.invalidateQueries({ queryKey: ['team-presence'] });
    }
  });

  // Single useEffect for ALL presence logic - runs ONCE at app root
  useEffect(() => {
    if (!user) return;

    // Set user online when component mounts
    updatePresenceMutation.mutate({ status: 'online' });

    // Keep updating user activity every 2 minutes while active
    const activityInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updatePresenceMutation.mutate({ status: 'online' });
      }
    }, 120000); // 2 minutes

    // Handle tab visibility changes to set online/offline more reliably
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updatePresenceMutation.mutate({ status: 'offline' });
      } else {
        updatePresenceMutation.mutate({ status: 'online' });
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    // Attempt to mark user offline before unload
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

  const updateStatus = (status: UserPresence['status'], activity?: string) => {
    updatePresenceMutation.mutate({ status, activity });
  };

  const updateActivity = (activity: string) => {
    updatePresenceMutation.mutate({ status: 'online', activity });
  };

  const currentUser = user ? activeUsers.find(u => u.user_id === user.id) || null : null;

  return (
    <PresenceContext.Provider 
      value={{ 
        activeUsers, 
        isLoading, 
        updateStatus, 
        updateActivity, 
        currentUser 
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
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

// Hook to consume the context
export const useUserPresence = () => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('useUserPresence must be used within PresenceProvider');
  }
  return context;
};
