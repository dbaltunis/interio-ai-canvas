import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export const useTypingIndicator = (conversationId: string | null) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  // Send typing indicator
  const sendTypingIndicator = (typing: boolean) => {
    if (!user || !conversationId || !channelRef.current) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        user_name: user.email,
        conversation_id: conversationId,
        typing
      }
    });

    setIsTyping(typing);

    // Auto-stop typing after 3 seconds of inactivity
    if (typing) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false);
      }, 3000);
    }
  };

  // Setup real-time channel for typing indicators
  useEffect(() => {
    if (!user || !conversationId) {
      setTypingUsers([]);
      return;
    }

    const channelName = `typing-${conversationId}`;
    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, typing } = payload.payload;
        
        // Don't show our own typing indicator
        if (user_id === user.id) return;

        setTypingUsers(prev => {
          if (typing) {
            return prev.includes(user_id) ? prev : [...prev, user_id];
          } else {
            return prev.filter(id => id !== user_id);
          }
        });
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user, conversationId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers,
    isTyping,
    sendTypingIndicator
  };
};