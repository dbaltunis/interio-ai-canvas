
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send } from 'lucide-react';
import { useUserMessages } from '@/hooks/useUserMessages';
import { useAuth } from '@/components/auth/AuthProvider';

interface MessageThreadProps {
  userId: string;
  onBack: () => void;
}

interface Message {
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

const MessageThread = ({ userId, onBack }: MessageThreadProps) => {
  const { user } = useAuth();
  const { sendMessage, getConversation, markAsRead } = useUserMessages();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const loadConversation = async () => {
    setLoading(true);
    const conversation = await getConversation(userId);
    setMessages(conversation as Message[]);
    setLoading(false);
    
    // Mark unread messages as read
    const unreadMessages = conversation
      .filter(msg => msg.recipient_id === user?.id && !msg.read_at)
      .map(msg => msg.id);
    
    if (unreadMessages.length > 0) {
      await markAsRead(unreadMessages);
    }
  };

  useEffect(() => {
    loadConversation();
  }, [userId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage(userId, newMessage);
    setNewMessage('');
    // Reload conversation to show the new message
    setTimeout(() => loadConversation(), 100);
  };

  const otherUser = messages[0]?.sender_id === user?.id 
    ? messages[0]?.recipient_profile 
    : messages[0]?.sender_profile;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-3 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Avatar className="w-8 h-8">
          <AvatarImage src={otherUser?.avatar_url || ''} />
          <AvatarFallback>
            {otherUser?.display_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{otherUser?.display_name || 'Unknown User'}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isFromMe = message.sender_id === user?.id;
              const senderProfile = isFromMe ? message.sender_profile : message.recipient_profile;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isFromMe ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={senderProfile?.avatar_url || ''} />
                    <AvatarFallback>
                      {senderProfile?.display_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        isFromMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                      {isFromMe && (
                        <span className="text-xs text-muted-foreground">
                          {message.read_at ? 'Read' : 'Sent'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="flex gap-2 p-3 border-t">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="sm">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default MessageThread;
