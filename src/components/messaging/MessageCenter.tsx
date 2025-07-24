
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X } from 'lucide-react';
import { useUserMessages } from '@/hooks/useUserMessages';
import MessageThread from './MessageThread';
import ActiveUsersList from './ActiveUsersList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MessageCenter = () => {
  const { threads, loading } = useUserMessages();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const totalUnread = threads.reduce((sum, thread) => sum + thread.unread_count, 0);

  const handleStartMessage = (userId: string) => {
    setSelectedThread(userId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <MessageCircle className="w-5 h-5" />
          {totalUnread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalUnread > 9 ? '9+' : totalUnread}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Messages</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {selectedThread ? (
            <MessageThread 
              userId={selectedThread} 
              onBack={() => setSelectedThread(null)} 
            />
          ) : (
            <Tabs defaultValue="conversations" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conversations">
                  Conversations
                  {totalUnread > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {totalUnread}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="active">Active Users</TabsTrigger>
              </TabsList>
              
              <TabsContent value="conversations" className="h-[calc(100%-2.5rem)]">
                <div className="space-y-2 h-full overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading conversations...
                    </div>
                  ) : threads.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No conversations yet. Start messaging someone from the Active Users tab!
                    </div>
                  ) : (
                    threads.map((thread) => (
                      <div
                        key={thread.user_id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => setSelectedThread(thread.user_id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {thread.user_profile.display_name || 'Unknown User'}
                            </p>
                            {thread.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {thread.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {thread.last_message.message}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(thread.last_message.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="active" className="h-[calc(100%-2.5rem)]">
                <ActiveUsersList onStartMessage={handleStartMessage} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageCenter;
