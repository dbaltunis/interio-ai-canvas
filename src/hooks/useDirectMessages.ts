import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  sender_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  user_id: string;
  user_profile: {
    display_name: string;
    avatar_url?: string;
    status: string;
  };
  last_message?: DirectMessage;
  unread_count: number;
}

export const useDirectMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<DirectMessage[]>([]);

  // Get all conversations for current user
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user) return [];

      // This is a simplified query - you'd need to create a more complex query
      // to get actual message data. For now, we'll get user profiles
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          display_name,
          avatar_url,
          status
        `)
        .neq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      return profiles.map(profile => ({
        user_id: profile.user_id,
        user_profile: {
          display_name: profile.display_name || 'Unknown User',
          avatar_url: profile.avatar_url,
          status: profile.status || 'offline'
        },
        unread_count: 0 // TODO: Calculate actual unread count
      }));
    },
    enabled: !!user,
  });

  // Get messages for active conversation (using local messages for now)
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', activeConversation, user?.id],
    queryFn: async (): Promise<DirectMessage[]> => {
      if (!user || !activeConversation) return [];

      // Filter local messages for the active conversation
      return localMessages.filter(msg => 
        (msg.sender_id === user.id && msg.recipient_id === activeConversation) ||
        (msg.sender_id === activeConversation && msg.recipient_id === user.id)
      );
    },
    enabled: !!user && !!activeConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Create a new local message
      const newMessage: DirectMessage = {
        id: `temp-${Date.now()}-${Math.random()}`,
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        created_at: new Date().toISOString(),
        sender_profile: {
          display_name: user.email || 'You',
          avatar_url: undefined
        }
      };

      // Add to local messages immediately
      setLocalMessages(prev => [...prev, newMessage]);
      
      // TODO: Send to actual database when table exists
      console.log('Would send message to database:', newMessage);
      
      return newMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationUserId: string) => {
      if (!user) return;
      
      // TODO: Implement marking messages as read
      console.log('Would mark messages as read for conversation with', conversationUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  // Set up real-time subscriptions for new messages
  useEffect(() => {
    if (!user) return;

    // Create unique channel name to avoid conflicts
    const channelName = `messages-${user.id}-${Date.now()}`;
    
    console.log('Setting up message subscription for user', user.id);
    
    // TODO: Set up real-time subscription for messages table when it exists
    // For now, just log that we would set it up
    
    return () => {
      // Cleanup subscription when implemented
      console.log('Cleaning up message subscription');
    };
  }, [user, queryClient]);

  const sendMessage = (recipientId: string, content: string) => {
    sendMessageMutation.mutate({ recipientId, content });
  };

  const openConversation = (userId: string) => {
    setActiveConversation(userId);
    markAsReadMutation.mutate(userId);
  };

  const closeConversation = () => {
    setActiveConversation(null);
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unread_count, 0);
  };

  return {
    conversations,
    messages,
    activeConversation,
    conversationsLoading,
    messagesLoading,
    sendMessage,
    openConversation,
    closeConversation,
    sendingMessage: sendMessageMutation.isPending,
    totalUnreadCount: getTotalUnreadCount()
  };
};