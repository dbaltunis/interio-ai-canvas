import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatDistanceToNow } from "date-fns";
import { Activity, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RealtimeUpdate {
  id: string;
  type: 'permission_change' | 'role_change' | 'user_update';
  message: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

export const RealtimePermissionUpdates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);

  useEffect(() => {
    if (!isEnabled) return;

    const channel = supabase
      .channel('permission-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_permissions'
        },
        (payload) => {
          console.log('Permission change:', payload);
          
          const update: RealtimeUpdate = {
            id: `perm-${Date.now()}`,
            type: 'permission_change',
            message: `Permission ${payload.eventType === 'INSERT' ? 'granted' : 'revoked'}: ${(payload.new as any)?.permission_name || (payload.old as any)?.permission_name}`,
            timestamp: new Date(),
            userId: (payload.new as any)?.user_id || (payload.old as any)?.user_id,
            userName: 'User'
          };
          
          setUpdates(prev => [update, ...prev.slice(0, 19)]);
          
          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
          queryClient.invalidateQueries({ queryKey: ["custom-permissions"] });
          
          toast({
            title: "Permission Updated",
            description: update.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: 'role=neq.null'
        },
        (payload) => {
          console.log('Role change:', payload);
          
          const oldRole = (payload.old as any)?.role;
          const newRole = (payload.new as any)?.role;
          
          if (oldRole !== newRole) {
            const update: RealtimeUpdate = {
              id: `role-${Date.now()}`,
              type: 'role_change',
              message: `Role changed from ${oldRole} to ${newRole}`,
              timestamp: new Date(),
              userId: (payload.new as any)?.user_id,
              userName: (payload.new as any)?.display_name || 'User'
            };
            
            setUpdates(prev => [update, ...prev.slice(0, 19)]);
            
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
            
            toast({
              title: "Role Updated",
              description: update.message,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [isEnabled, queryClient, toast]);

  const getUpdateIcon = (type: RealtimeUpdate['type']) => {
    switch (type) {
      case 'permission_change':
        return '🔐';
      case 'role_change':
        return '👤';
      case 'user_update':
        return '✏️';
      default:
        return '📝';
    }
  };

  const getUpdateColor = (type: RealtimeUpdate['type']) => {
    switch (type) {
      case 'permission_change':
        return 'bg-blue-50 border-blue-200';
      case 'role_change':
        return 'bg-green-50 border-green-200';
      case 'user_update':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-time Updates
            </CardTitle>
            <CardDescription>
              Live feed of permission and role changes
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Enable updates</label>
              <Switch 
                checked={isEnabled} 
                onCheckedChange={setIsEnabled}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isEnabled ? (
          <div className="text-center text-muted-foreground py-8">
            Real-time updates are disabled
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No recent updates. Changes will appear here automatically.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {updates.map((update) => (
              <div key={update.id} className={`flex items-start space-x-3 p-3 border rounded-lg ${getUpdateColor(update.type)}`}>
                <div className="text-lg">{getUpdateIcon(update.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{update.message}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(update.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    User: {update.userName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};