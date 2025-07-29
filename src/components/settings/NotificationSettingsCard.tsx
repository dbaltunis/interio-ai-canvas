import { useState } from "react";
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
  const [emailProvider, setEmailProvider] = useState(settings?.email_service_provider || 'resend');
  const [emailApiKey, setEmailApiKey] = useState('');
  const [emailFromAddress, setEmailFromAddress] = useState(settings?.email_from_address || '');
  const [emailFromName, setEmailFromName] = useState(settings?.email_from_name || '');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      email_notifications_enabled: emailEnabled,
      sms_notifications_enabled: smsEnabled,
      email_service_provider: emailProvider as any,
      email_api_key_encrypted: emailApiKey || undefined,
      email_from_address: emailFromAddress || undefined,
      email_from_name: emailFromName || undefined,
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
                Receive email reminders for your appointments
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
                  <strong>How to get your API key:</strong>
                  <br />
                  1. Go to <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Resend.com <ExternalLink className="h-3 w-3" />
                  </a> and create a free account
                  <br />
                  2. Verify your domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    resend.com/domains <ExternalLink className="h-3 w-3" />
                  </a>
                  <br />
                  3. Create an API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    resend.com/api-keys <ExternalLink className="h-3 w-3" />
                  </a>
                  <br />
                  4. Paste your API key below (starts with "re_")
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email-provider">Email Service</Label>
                  <Select value={emailProvider} onValueChange={(value) => setEmailProvider(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resend">Resend (Recommended)</SelectItem>
                      <SelectItem value="sendgrid" disabled>SendGrid (Coming Soon)</SelectItem>
                      <SelectItem value="mailgun" disabled>Mailgun (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="email-from-name">From Name</Label>
                  <Input
                    id="email-from-name"
                    value={emailFromName}
                    onChange={(e) => setEmailFromName(e.target.value)}
                    placeholder="Your Name or Business"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email-from-address">From Email Address</Label>
                <Input
                  id="email-from-address"
                  type="email"
                  value={emailFromAddress}
                  onChange={(e) => setEmailFromAddress(e.target.value)}
                  placeholder="notifications@yourdomain.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be a verified domain in your Resend account
                </p>
              </div>

              <div>
                <Label htmlFor="email-api-key" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  API Key
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="email-api-key"
                    type={showApiKey ? "text" : "password"}
                    value={emailApiKey}
                    onChange={(e) => setEmailApiKey(e.target.value)}
                    placeholder={settings?.email_api_key_encrypted ? "••••••••••••••••" : "re_your_api_key_here"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your API key is encrypted and stored securely
                </p>
              </div>
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
                Receive SMS reminders for your appointments (Coming Soon)
              </p>
            </div>
            <Switch
              checked={smsEnabled}
              onCheckedChange={setSmsEnabled}
              disabled
            />
          </div>
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