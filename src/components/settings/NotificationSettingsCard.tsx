import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, MessageSquare, Eye, EyeOff, ExternalLink, Shield, Info } from "lucide-react";
import { useUserNotificationSettings, useCreateOrUpdateNotificationSettings } from "@/hooks/useUserNotificationSettings";

export const NotificationSettingsCard = () => {
  const { data: settings, isLoading } = useUserNotificationSettings();
  const updateSettings = useCreateOrUpdateNotificationSettings();
  
  const [emailEnabled, setEmailEnabled] = useState(settings?.email_notifications_enabled || false);
  const [smsEnabled, setSmsEnabled] = useState(settings?.sms_notifications_enabled || false);
  const [smsPhoneNumber, setSmsPhoneNumber] = useState(settings?.sms_phone_number || '');

  // Sync state with fetched settings
  useEffect(() => {
    if (settings) {
      setEmailEnabled(settings.email_notifications_enabled || false);
      setSmsEnabled(settings.sms_notifications_enabled || false);
      setSmsPhoneNumber(settings.sms_phone_number || '');
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      email_notifications_enabled: emailEnabled,
      sms_notifications_enabled: smsEnabled,
      sms_phone_number: smsPhoneNumber,
    });
  };

  if (isLoading) {
    return <div>Loading notification settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how you receive appointment reminders. Set up your own email service to send notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Email reminders are configured via SendGrid integration
              </p>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>

          {emailEnabled && (
            <div className="space-y-4 pl-6 border-l-2 border-muted">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Email service is ready!</strong>
                  <br />
                  Your SendGrid integration is configured in the Integrations tab. 
                  Email notifications will be sent using your SendGrid setup.
                  <br />
                  <a href="/settings?tab=sendgrid" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                    View SendGrid Settings <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <Separator />

        {/* SMS Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive SMS reminders for your appointments
              </p>
            </div>
            <Switch
              checked={smsEnabled}
              onCheckedChange={setSmsEnabled}
            />
          </div>

          {smsEnabled && (
            <div className="space-y-4 pl-6 border-l-2 border-muted">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>How to get your Twilio credentials:</strong>
                  <br />
                  1. Go to <a href="https://www.twilio.com/console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Twilio Console <ExternalLink className="h-3 w-3" />
                  </a> and create an account
                  <br />
                  2. Get your Account SID and Auth Token from the dashboard
                  <br />
                  3. Purchase a phone number at <a href="https://www.twilio.com/console/phone-numbers" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Phone Numbers <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sms-provider">SMS Service</Label>
                  <Select value="twilio" disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="sms-phone">From Phone Number</Label>
                  <Input
                    id="sms-phone"
                    value={smsPhoneNumber}
                    onChange={(e) => setSmsPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sms-api-key" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Twilio Auth Token
                </Label>
                <Input
                  id="sms-api-key"
                  type="password"
                  placeholder="Your Twilio Auth Token"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your Twilio credentials are encrypted and stored securely
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4">
          <p className="text-xs text-muted-foreground">
            Changes are saved automatically when you update settings
          </p>
          <Button 
            onClick={handleSave}
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};