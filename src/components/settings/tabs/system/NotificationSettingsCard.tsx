import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, Info } from "lucide-react";
import { 
  useUserNotificationSettings, 
  useCreateOrUpdateNotificationSettings 
} from "@/hooks/useUserNotificationSettings";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

export const NotificationSettingsCard = () => {
  const { data: settings, isLoading } = useUserNotificationSettings();
  const updateSettings = useCreateOrUpdateNotificationSettings();
  
  // Local state for immediate UI feedback
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [desktopEnabled, setDesktopEnabled] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  // Sync with database when settings load
  useEffect(() => {
    console.log('[NotificationSettingsCard] Settings received:', settings);
    if (settings) {
      console.log('[NotificationSettingsCard] Setting states:', {
        email: settings.email_notifications_enabled,
        sms: settings.sms_notifications_enabled,
        desktop: settings.desktop_notifications_enabled,
        reminders: settings.appointment_reminders_enabled
      });
      setEmailEnabled(settings.email_notifications_enabled ?? true);
      setSmsEnabled(settings.sms_notifications_enabled ?? false);
      setDesktopEnabled(settings.desktop_notifications_enabled ?? false);
      setRemindersEnabled(settings.appointment_reminders_enabled ?? true);
    }
  }, [settings]);

  const handleToggle = async (
    field: string,
    value: boolean,
    setter: (v: boolean) => void
  ) => {
    setter(value);
    
    try {
      await updateSettings.mutateAsync({
        [field]: value,
      });
    } catch (error) {
      // Revert on error
      setter(!value);
    }
  };

  const handleDesktopToggle = async (enabled: boolean) => {
    if (enabled) {
      // Request browser permission
      if (!('Notification' in window)) {
        toast.error('Desktop notifications are not supported in this browser');
        return;
      }
      
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Desktop notification permission denied');
        return;
      }
      
      toast.success('Desktop notifications enabled');
    }
    
    handleToggle('desktop_notifications_enabled', enabled, setDesktopEnabled);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch 
              checked={emailEnabled}
              onCheckedChange={(checked) => 
                handleToggle('email_notifications_enabled', checked, setEmailEnabled)
              }
              disabled={updateSettings.isPending}
            />
          </div>
          
          {/* SMS Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive updates via SMS</p>
            </div>
            <Switch 
              checked={smsEnabled}
              onCheckedChange={(checked) => 
                handleToggle('sms_notifications_enabled', checked, setSmsEnabled)
              }
              disabled={updateSettings.isPending}
            />
          </div>
          
          {/* Desktop Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Desktop Notifications</Label>
              <p className="text-xs text-muted-foreground">Show browser notifications</p>
            </div>
            <Switch 
              checked={desktopEnabled}
              onCheckedChange={handleDesktopToggle}
              disabled={updateSettings.isPending}
            />
          </div>
          
          {/* Appointment Reminders */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Appointment Reminders</Label>
              <p className="text-xs text-muted-foreground">Remind about appointments</p>
            </div>
            <Switch 
              checked={remindersEnabled}
              onCheckedChange={(checked) => 
                handleToggle('appointment_reminders_enabled', checked, setRemindersEnabled)
              }
              disabled={updateSettings.isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
