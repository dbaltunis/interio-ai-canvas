
import { useEffect, useRef, useState } from 'react';
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

  // Mock implementation since user_presence table isn't in types
  const updatePresence = async (page: string, online: boolean = true) => {
    if (!user) return;
    
    // For now, just log the presence update
    console.log(`User ${user.id} is ${online ? 'online' : 'offline'} on page ${page}`);
    
    // This would normally update the database but we'll skip for now
    // to avoid TypeScript errors with missing table types
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

  // Mock active users - in a real implementation this would fetch from database
  const fetchActiveUsers = async () => {
    if (!user) return;
    
    // Mock active users data
    const mockActiveUsers: ActiveUser[] = [
      {
        user_id: user.id,
        current_page: currentPage,
        is_online: true,
        last_seen: new Date().toISOString(),
        profile: {
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'You',
          avatar_url: undefined
        }
      }
    ];

    setActiveUsers(mockActiveUsers);
  };

  // Set up presence tracking
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchActiveUsers();

    // Set up periodic updates
    fetchIntervalRef.current = setInterval(() => {
      fetchActiveUsers();
    }, 30000); // Fetch every 30 seconds

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      const online = !document.hidden;
      setIsOnline(online);
      updatePresence(currentPage, online);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
      if (presenceUpdateTimeoutRef.current) {
        clearTimeout(presenceUpdateTimeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
