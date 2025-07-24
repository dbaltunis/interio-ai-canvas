
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users, Eye } from 'lucide-react';
import { useUserPresence } from '@/hooks/useUserPresence';

export const ActiveUsers = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeUsers } = useUserPresence();

  const getPageDisplayName = (page: string) => {
    if (page.includes('projects')) return 'Jobs';
    if (page.includes('clients')) return 'CRM';
    if (page.includes('quotes')) return 'Emails';
    if (page.includes('calendar')) return 'Calendar';
    if (page.includes('inventory')) return 'Library';
    if (page.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  const onlineUsers = activeUsers.filter(user => user.is_online);

  if (onlineUsers.length === 0) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <Users className="h-4 w-4" />
        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
          0
        </Badge>
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Users className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {onlineUsers.length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Users ({onlineUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {onlineUsers.map((user) => (
                <div key={user.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-brand-secondary text-brand-primary text-xs">
                        {user.profile?.display_name?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {user.profile?.display_name || 'Unknown User'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{getPageDisplayName(user.current_page)}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {new Date(user.last_seen).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
