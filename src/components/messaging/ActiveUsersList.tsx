
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, MapPin, Briefcase } from 'lucide-react';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useAuth } from '@/components/auth/AuthProvider';

interface ActiveUsersListProps {
  onStartMessage?: (userId: string) => void;
}

const ActiveUsersList = ({ onStartMessage }: ActiveUsersListProps) => {
  const { activeUsers, loading } = useUserPresence();
  const { user } = useAuth();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Active Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const otherUsers = activeUsers.filter(u => u.user_id !== user?.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Active Users ({otherUsers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {otherUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other users online</p>
            ) : (
              otherUsers.map((presence) => (
                <div key={presence.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={presence.user_profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          {presence.user_profiles?.display_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {presence.user_profiles?.display_name || 'Unknown User'}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {presence.user_profiles?.status || 'available'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {presence.current_page && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{presence.current_page}</span>
                          </div>
                        )}
                        {presence.current_job_id && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Briefcase className="w-3 h-3" />
                            <span>Working on job</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {onStartMessage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onStartMessage(presence.user_id)}
                      className="h-8 w-8 p-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActiveUsersList;
