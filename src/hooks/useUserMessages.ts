
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

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
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isInitialized = useRef(false);

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

    const { data: messagesData, error: messagesError } = await supabase
      .from('user_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching conversation:', messagesError);
      return [];
    }

    const userIds = Array.from(new Set([
      ...messagesData.map(msg => msg.sender_id),
      ...messagesData.map(msg => msg.recipient_id)
    ]));

    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    const profilesMap = new Map();
    profilesData?.forEach(profile => {
      profilesMap.set(profile.user_id, {
        display_name: profile.display_name,
        avatar_url: profile.avatar_url
      });
    });

    const transformedData: UserMessage[] = messagesData.map(item => ({
      id: item.id,
      sender_id: item.sender_id,
      recipient_id: item.recipient_id,
      message: item.message,
      read_at: item.read_at,
      created_at: item.created_at,
      sender_profile: profilesMap.get(item.sender_id) || null,
      recipient_profile: profilesMap.get(item.recipient_id) || null
    }));

    return transformedData;
  };

  // Fetch message threads
  const fetchThreads = async () => {
    if (!user) return;

    const { data: messagesData, error: messagesError } = await supabase
      .from('user_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('Error fetching threads:', messagesError);
      setLoading(false);
      return;
    }

    const userIds = Array.from(new Set([
      ...messagesData.map(msg => msg.sender_id),
      ...messagesData.map(msg => msg.recipient_id)
    ])).filter(id => id !== user.id);

    let profilesData = [];
    if (userIds.length > 0) {
      const { data, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, avatar_url')
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
        avatar_url: profile.avatar_url
      });
    });

    const threadMap = new Map<string, MessageThread>();
    
    messagesData?.forEach((item) => {
      const message: UserMessage = {
        id: item.id,
        sender_id: item.sender_id,
        recipient_id: item.recipient_id,
        message: item.message,
        read_at: item.read_at,
        created_at: item.created_at,
        sender_profile: profilesMap.get(item.sender_id) || null,
        recipient_profile: profilesMap.get(item.recipient_id) || null
      };

      const otherUserId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
      const otherUserProfile = profilesMap.get(otherUserId) || { display_name: null, avatar_url: null };
      
      if (!threadMap.has(otherUserId)) {
        threadMap.set(otherUserId, {
          user_id: otherUserId,
          user_profile: otherUserProfile,
          last_message: message,
          unread_count: 0,
        });
      }
      
      if (message.recipient_id === user.id && !message.read_at) {
        const thread = threadMap.get(otherUserId)!;
        thread.unread_count++;
      }
    });

    setThreads(Array.from(threadMap.values()));
    setLoading(false);
  };

  // Clean up existing channel
  const cleanupChannel = () => {
    if (channelRef.current) {
      console.log('Cleaning up messages channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!user || isInitialized.current) return;

    console.log('Setting up messages subscription for user:', user.id);
    
    // Clean up any existing channel first
    cleanupChannel();

    // Fetch initial data
    fetchThreads();

    // Create new channel with unique name
    const channelName = `user-messages-${user.id}-${Date.now()}`;
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_messages' },
        (payload) => {
          console.log('Message change detected:', payload);
          fetchThreads();
        }
      )
      .subscribe((status) => {
        console.log('Messages subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isInitialized.current = true;
        }
      });

    return () => {
      console.log('Cleaning up messages subscription');
      cleanupChannel();
      isInitialized.current = false;
    };
  }, [user?.id]);

  return {
    messages,
    threads,
    loading,
    sendMessage,
    markAsRead,
    getConversation,
  };
};
