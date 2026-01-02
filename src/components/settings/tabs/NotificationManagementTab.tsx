import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Crown, Zap, Settings2, Clock, CheckCircle } from "lucide-react";
import { NotificationTemplatesManager } from "@/components/notifications/NotificationTemplatesManager";
import { BroadcastNotificationPanel } from "@/components/notifications/BroadcastNotificationPanel";
import { NotificationTestPanel } from "@/components/notifications/NotificationTestPanel";
import { useUserSubscription } from "@/hooks/useUserSubscription";

export const NotificationManagementTab = () => {
  const { data: subscription } = useUserSubscription();

  const isPremiumUser = subscription?.plan?.name !== 'Basic';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure when and how notifications are sent to you and your clients
        </p>
      </div>

      {/* Notification Status Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Templates</p>
                <p className="text-xs text-muted-foreground truncate">
                  Customize message content
                </p>
              </div>
              <Badge variant="default" className="text-[10px] shrink-0">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={`p-2 rounded-full ${isPremiumUser ? 'bg-purple-100' : 'bg-muted'}`}>
                <Send className={`h-4 w-4 ${isPremiumUser ? 'text-purple-600' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm flex items-center gap-1">
                  Broadcasts
                  {!isPremiumUser && <Crown className="h-3 w-3 text-amber-500" />}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {isPremiumUser ? 'Send bulk messages' : 'Upgrade required'}
                </p>
              </div>
              <Badge variant={isPremiumUser ? "default" : "outline"} className="text-[10px] shrink-0">
                {isPremiumUser ? 'Active' : 'Pro'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Automation</p>
                <p className="text-xs text-muted-foreground truncate">
                  Auto-send reminders
                </p>
              </div>
              <Badge variant="default" className="text-[10px] shrink-0">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
          
          {!isPremiumUser && (
            <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-primary">Upgrade for More Features</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Unlock broadcast messaging to send bulk notifications to multiple clients at once.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">Broadcast messaging</Badge>
                <Badge variant="outline">Scheduled notifications</Badge>
                <Badge variant="outline">Advanced analytics</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Panel */}
      <NotificationTestPanel />

      {/* Notification Management Tabs */}
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="broadcast" disabled={!isPremiumUser} className="flex items-center gap-1">
            Broadcast Messages
            {!isPremiumUser && <Crown className="h-3 w-3 ml-1" />}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="mt-6">
          <NotificationTemplatesManager />
        </TabsContent>
        
        <TabsContent value="broadcast" className="mt-6">
          {isPremiumUser ? (
            <BroadcastNotificationPanel />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Crown className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
                <p className="text-center text-muted-foreground mb-4">
                  Broadcast notifications are available with Professional and Enterprise plans.
                </p>
                <Badge variant="outline">Upgrade Required</Badge>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};