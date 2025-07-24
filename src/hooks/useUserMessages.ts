
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  read_at: string | null;
  created_at: string;
  sender_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  recipient_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface MessageThread {
  user_id: string;
  user_profile: {
    display_name: string | null;
    avatar_url: string | null;
  };
  last_message: UserMessage;
  unread_count: number;
}

export const useUserMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);

  // Send a message
  const sendMessage = async (recipientId: string, message: string) => {
    if (!user) return;

    console.log('Sending message:', { recipientId, message });

    const { error } = await supabase
      .from('user_messages')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        message: message.trim(),
      });

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    }
  };

  // Mark messages as read
  const markAsRead = async (messageIds: string[]) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', messageIds)
      .eq('recipient_id', user.id);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Get messages for a specific conversation
  const getConversation = async (otherUserId: string) => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_messages')
      .select(`
        *,
        sender_profile:user_profiles!user_messages_sender_id_fkey (
          display_name,
          avatar_url
        ),
        recipient_profile:user_profiles!user_messages_recipient_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching conversation:', error);
      return [];
    }

    return data || [];
  };

  // Fetch message threads
  const fetchThreads = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_messages')
      .select(`
        *,
        sender_profile:user_profiles!user_messages_sender_id_fkey (
          display_name,
          avatar_url
        ),
        recipient_profile:user_profiles!user_messages_recipient_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching threads:', error);
      setLoading(false);
      return;
    }

    // Group messages by conversation
    const threadMap = new Map<string, MessageThread>();
    
    data?.forEach((message) => {
      const otherUserId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
      const otherUserProfile = message.sender_id === user.id ? message.recipient_profile : message.sender_profile;
      
      if (!threadMap.has(otherUserId)) {
        threadMap.set(otherUserId, {
          user_id: otherUserId,
          user_profile: otherUserProfile || { display_name: null, avatar_url: null },
          last_message: message,
          unread_count: 0,
        });
      }
      
      // Count unread messages
      if (message.recipient_id === user.id && !message.read_at) {
        const thread = threadMap.get(otherUserId)!;
        thread.unread_count++;
      }
    });

    setThreads(Array.from(threadMap.values()));
    setLoading(false);
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    fetchThreads();

    const channel = supabase
      .channel('user-messages-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_messages' },
        (payload) => {
          console.log('Message change:', payload);
          fetchThreads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    messages,
    threads,
    loading,
    sendMessage,
    markAsRead,
    getConversation,
  };
};
