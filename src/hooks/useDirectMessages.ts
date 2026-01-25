import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useFilteredTeamPresence } from './useFilteredTeamPresence';

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
}

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
  attachments?: MessageAttachment[];
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
  const [uploadProgress, setUploadProgress] = useState(0);

  // Use filtered team presence data - dealers only see Owners/Admins/System Owners
  const { data: teamPresence = [] } = useFilteredTeamPresence();

  // Calculate status based on last_seen timestamp
  const calculateStatus = (lastSeen: string | null, userId: string): string => {
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

  // Conversations: use presence view for consistent status
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id, teamPresence.length],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user || teamPresence.length === 0) return [];

      // Build conversations with unread counts (simple per-user count)
      const results: Conversation[] = [];

      for (const row of teamPresence) {
        // Skip current user - don't show self in conversations list
        if (row.user_id === user.id) continue;
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
            avatar_url: undefined,
            status: calculateStatus(row.last_seen, row.user_id),
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
    enabled: !!user && teamPresence.length > 0,
  });

  // Fetch messages for active conversation with attachments
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', activeConversation, user?.id],
    queryFn: async (): Promise<DirectMessage[]> => {
      if (!user || !activeConversation) return [];

      console.log('Fetching messages for conversation:', activeConversation, 'user:', user.id);
      
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${activeConversation}),and(sender_id.eq.${activeConversation},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      // Fetch attachments for these messages
      if (messagesData && messagesData.length > 0) {
        const messageIds = messagesData.map(m => m.id);
        const { data: attachmentsData } = await supabase
          .from('message_attachments')
          .select('*')
          .in('message_id', messageIds);

        // Group attachments by message_id
        const attachmentsByMessage = (attachmentsData || []).reduce((acc, att) => {
          if (!acc[att.message_id]) acc[att.message_id] = [];
          acc[att.message_id].push(att as MessageAttachment);
          return acc;
        }, {} as Record<string, MessageAttachment[]>);

        // Merge attachments into messages
        const messagesWithAttachments = messagesData.map(msg => ({
          ...msg,
          attachments: attachmentsByMessage[msg.id] || []
        }));

        console.log('Fetched messages:', messagesWithAttachments.length, 'messages for conversation:', activeConversation);
        return messagesWithAttachments as DirectMessage[];
      }
      
      console.log('Fetched messages:', messagesData?.length || 0, 'messages for conversation:', activeConversation);
      return (messagesData || []) as DirectMessage[];
    },
    enabled: !!user && !!activeConversation,
  });

  // Upload file to storage
  const uploadFile = async (file: File, userId: string): Promise<{ url: string; path: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(filePath);

    return { url: urlData.publicUrl, path: filePath };
  };

  // Send message with optional attachments
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      recipientId, 
      content, 
      files 
    }: { 
      recipientId: string; 
      content: string;
      files?: File[];
    }) => {
      if (!user) throw new Error('Not authenticated');
      if (!content?.trim() && (!files || files.length === 0)) {
        throw new Error('Message cannot be empty');
      }

      // Insert message
      const { data: messageData, error: messageError } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim() || '',
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Upload files and create attachment records
      if (files && files.length > 0) {
        setUploadProgress(0);
        const totalFiles = files.length;
        const attachments: {
          message_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_url: string;
        }[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            const { url } = await uploadFile(file, user.id);
            attachments.push({
              message_id: messageData.id,
              file_name: file.name,
              file_type: file.type || 'application/octet-stream',
              file_size: file.size,
              file_url: url,
            });
            setUploadProgress(((i + 1) / totalFiles) * 100);
          } catch (err) {
            console.error('Error uploading file:', file.name, err);
          }
        }

        // Insert attachment records
        if (attachments.length > 0) {
          const { error: attachError } = await supabase
            .from('message_attachments')
            .insert(attachments);

          if (attachError) {
            console.error('Error saving attachments:', attachError);
          }
        }
      }

      setUploadProgress(0);
      return { ...messageData, attachments: [] } as DirectMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversation, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
    onError: (error) => {
      setUploadProgress(0);
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
              return [...oldMessages, { ...newMessage, attachments: [] }];
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

  const sendMessage = (recipientId: string, content: string, files?: File[]) => {
    sendMessageMutation.mutate({ recipientId, content, files });
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
    uploadProgress,
    totalUnreadCount
  };
};
