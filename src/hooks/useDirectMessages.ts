
import { useState, useEffect, useMemo } from 'react';
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
    status: string; // online | away | busy | offline | never_logged_in
  };
  last_message?: DirectMessage;
  unread_count: number;
}

export const useDirectMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Conversations: use presence view for consistent status
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user) return [];

      // Get visible team (presence-enabled) - RLS ensures same account access
      const { data: presenceRows, error: presenceError } = await supabase
        .rpc('get_team_presence', { search_param: null });

      if (presenceError) throw presenceError;

      // Build conversations with unread counts (simple per-user count)
      const results: Conversation[] = [];

      for (const row of presenceRows || []) {
        // Count unread
        const { count, error: countError } = await supabase
          .from('direct_messages')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('sender_id', row.user_id)
          .is('read_at', null);

        if (countError) {
          console.warn('Unread count error:', countError);
        }

        // Optionally fetch last message between the two users (lightweight)
        const { data: lastMsgs, error: lastError } = await supabase
          .from('direct_messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${row.user_id}),and(sender_id.eq.${row.user_id},recipient_id.eq.${user.id})`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (lastError) {
          console.warn('Last message fetch error:', lastError);
        }

        results.push({
          user_id: row.user_id,
          user_profile: {
            display_name: row.display_name || 'Unknown User',
            avatar_url: row.avatar_url,
            status: (row.status as string) || 'offline',
          },
          last_message: lastMsgs?.[0] as DirectMessage | undefined,
          unread_count: count || 0,
        });
      }

      // Sort conversations by activity: users with messages first, then by last message time
      return results.sort((a, b) => {
        // Users with messages come first
        if (a.unread_count > 0 && b.unread_count === 0) return -1;
        if (b.unread_count > 0 && a.unread_count === 0) return 1;
        
        // If both have messages or both don't, sort by last message time
        const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
        const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
        
        return bTime - aTime; // Most recent first
      });
    },
    enabled: !!user,
  });

  // Fetch messages for active conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', activeConversation, user?.id],
    queryFn: async (): Promise<DirectMessage[]> => {
      if (!user || !activeConversation) return [];

      console.log('Fetching messages for conversation:', activeConversation, 'user:', user.id);
      
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${activeConversation}),and(sender_id.eq.${activeConversation},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      console.log('Fetched messages:', data?.length || 0, 'messages for conversation:', activeConversation);
      return (data || []) as DirectMessage[];
    },
    enabled: !!user && !!activeConversation,
  });

  // Send message using DB table
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');
      if (!content?.trim()) throw new Error('Message cannot be empty');

      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as DirectMessage;
    },
    onSuccess: () => {
      // Simple invalidation without complex optimistic updates
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversation, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  // Mark messages as read for a specific conversation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationUserId: string) => {
      if (!user) return;

      const { error } = await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', user.id)
        .eq('sender_id', conversationUserId)
        .is('read_at', null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  // Realtime subscription for direct messages with dependency on activeConversation
  useEffect(() => {
    if (!user) return;

    const channelName = `direct-messages-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `recipient_id=eq.${user.id}` },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as DirectMessage;
          
          // Immediately update messages if this is for the active conversation
          if (activeConversation === newMessage.sender_id) {
            queryClient.setQueryData(['messages', activeConversation, user.id], (oldMessages: DirectMessage[] = []) => {
              // Prevent duplicates
              if (oldMessages.some(msg => msg.id === newMessage.id)) {
                return oldMessages;
              }
              return [...oldMessages, newMessage];
            });
          }
          
          // Update conversations list to show new message
          queryClient.setQueryData(['conversations', user.id], (oldConversations: Conversation[] = []) => {
            return oldConversations.map(conv => 
              conv.user_id === newMessage.sender_id 
                ? { ...conv, last_message: newMessage, unread_count: conv.unread_count + 1 }
                : conv
            );
          });

          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `sender_id=eq.${user.id}` },
        (payload) => {
          console.log('Message sent confirmed:', payload);
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'direct_messages', filter: `recipient_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, activeConversation]);

  const sendMessage = (recipientId: string, content: string) => {
    sendMessageMutation.mutate({ recipientId, content });
  };

  const openConversation = (userId: string) => {
    if (activeConversation === userId) return; // Prevent duplicate calls
    
    setActiveConversation(userId);
    // mark unread as read only after setting conversation
    setTimeout(() => markAsReadMutation.mutate(userId), 100);
  };

  const closeConversation = () => {
    setActiveConversation(null);
  };

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);
  }, [conversations]);

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
    totalUnreadCount
  };
};
