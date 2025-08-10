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

      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${activeConversation}),` +
          `and(sender_id.eq.${activeConversation},recipient_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!activeConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('direct_messages')
        .insert({ sender_id: user.id, recipient_id: recipientId, content })
        .select()
        .single();

      if (error) throw error;
      return data as DirectMessage;
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
      const { error } = await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', conversationUserId)
        .eq('recipient_id', user.id)
        .is('read_at', null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`dm-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `recipient_id=eq.${user.id}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      })
      .subscribe();

    console.log('Setting up message subscription for user', user.id);

    return () => {
      supabase.removeChannel(channel);
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