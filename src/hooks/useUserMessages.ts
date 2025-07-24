
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface UserMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

interface MessageWithProfile extends UserMessage {
  sender_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export const useUserMessages = (recipientId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<any>(null);

  // Fetch messages for a specific conversation
  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: messagesData, error } = await supabase
        .from('user_messages')
        .select(`
          *,
          sender_profile:user_profiles!user_messages_sender_id_fkey(
            display_name,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('user_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (error) {
        console.error('Error fetching unread count:', error);
        return;
      }

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Send a message
  const sendMessage = async (recipientId: string, messageText: string) => {
    if (!user || !messageText.trim()) return;

    try {
      const { error } = await supabase
        .from('user_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          message: messageText.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  // Mark messages as read
  const markAsRead = async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('user_messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds)
        .eq('recipient_id', user.id);

      if (error) {
        console.error('Error marking messages as read:', error);
        return;
      }

      // Refresh unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Initial fetch of unread count
    fetchUnreadCount();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('user_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          fetchUnreadCount();
          
          // Show toast for new message
          toast({
            title: 'New message',
            description: 'You have received a new message'
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_messages'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user]);

  // Fetch messages when recipient changes
  useEffect(() => {
    if (recipientId && user) {
      fetchMessages(recipientId);
    }
  }, [recipientId, user]);

  return {
    messages,
    unreadCount,
    isLoading,
    sendMessage,
    markAsRead,
    fetchMessages,
    fetchUnreadCount
  };
};
