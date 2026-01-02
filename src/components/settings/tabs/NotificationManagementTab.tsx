import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, Send, Crown, Zap } from "lucide-react";
import { NotificationTemplatesManager } from "@/components/notifications/NotificationTemplatesManager";
import { BroadcastNotificationPanel } from "@/components/notifications/BroadcastNotificationPanel";
import { NotificationTestPanel } from "@/components/notifications/NotificationTestPanel";
import { WhatsAppTemplateManager } from "@/components/messaging/WhatsAppTemplateManager";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";

export const NotificationManagementTab = () => {
  const { data: subscription } = useUserSubscription();
  const { hasFeature } = useSubscriptionFeatures();

  const isPremiumUser = subscription?.plan?.name !== 'Basic';
  const hasWhatsApp = hasFeature('whatsapp');

  return (
    <div className="space-y-6">
      {/* Service Plan Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Notification Service Plan
              </CardTitle>
              <CardDescription>
                Your current notification service tier and features
              </CardDescription>
            </div>
            <Badge variant={isPremiumUser ? "default" : "secondary"} className="text-sm">
              {subscription?.plan?.name || 'Basic Plan'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Notification Setup</p>
                <p className="text-xs text-muted-foreground">
                  {isPremiumUser ? 'Built-in service ready' : 'Self-managed setup'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <MessageSquare className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Monthly Limits</p>
                <p className="text-xs text-muted-foreground">
                  {isPremiumUser ? 
                    (subscription?.plan?.name === 'Enterprise' ? 'Unlimited' : '200 emails, 100 SMS') : 
                    'Use your own accounts'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <Send className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Broadcast Messages</p>
                <p className="text-xs text-muted-foreground">
                  {isPremiumUser ? 'Available' : 'Upgrade required'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className={`p-2 rounded-full ${hasWhatsApp ? 'bg-green-100' : 'bg-muted'}`}>
                <MessageSquare className={`h-4 w-4 ${hasWhatsApp ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-medium text-sm flex items-center gap-1">
                  WhatsApp
                  {hasWhatsApp && <Badge variant="default" className="text-[10px] px-1">PRO</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasWhatsApp ? 'Enterprise feature' : 'Enterprise only'}
                </p>
              </div>
            </div>
          </div>
          
          {!isPremiumUser && (
            <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-primary">Upgrade to Managed Service</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Get instant notifications with zero setup - no need for your own SendGrid or Twilio accounts.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">Built-in email service</Badge>
                <Badge variant="outline">Built-in SMS service</Badge>
                <Badge variant="outline">Broadcast messaging</Badge>
                <Badge variant="outline">Usage tracking</Badge>
                <Badge variant="outline">WhatsApp (Enterprise)</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Panel */}
      <NotificationTestPanel />

      {/* Notification Management Tabs */}
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="broadcast" disabled={!isPremiumUser}>
            Broadcast Messages
            {!isPremiumUser && <Crown className="h-3 w-3 ml-1" />}
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-1">
            WhatsApp
            {!hasWhatsApp && <Crown className="h-3 w-3 ml-1" />}
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
                  Broadcast notifications are available with Managed Service and Enterprise plans.
                </p>
                <Badge variant="outline">Upgrade Required</Badge>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6">
          <WhatsAppTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};