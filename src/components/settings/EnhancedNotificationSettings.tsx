import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, TestTube, User, Clock, CheckCircle2, AlertCircle, Settings, Phone } from "lucide-react";
import { useCurrentUserProfile, useUpdateUserProfile } from "@/hooks/useUserProfile";
import { useUserNotificationSettings, useCreateOrUpdateNotificationSettings } from "@/hooks/useUserNotificationSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const EnhancedNotificationSettings = () => {
  const { data: profile } = useCurrentUserProfile();
  const { data: notificationSettings, isLoading } = useUserNotificationSettings();
  const updateProfile = useUpdateUserProfile();
  const updateNotificationSettings = useCreateOrUpdateNotificationSettings();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [emailNotifications, setEmailNotifications] = useState(profile?.email_notifications ?? true);
  const [smsNotifications, setSmsNotifications] = useState(profile?.sms_notifications ?? false);
  const [defaultNotificationMinutes, setDefaultNotificationMinutes] = useState(profile?.default_notification_minutes || 15);
  const [isTesting, setIsTesting] = useState({ email: false, sms: false });

  useEffect(() => {
    if (profile) {
      setPhoneNumber(profile.phone_number || '');
      setEmailNotifications(profile.email_notifications ?? true);
      setSmsNotifications(profile.sms_notifications ?? false);
      setDefaultNotificationMinutes(profile.default_notification_minutes || 15);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    await updateProfile.mutateAsync({
      phone_number: phoneNumber,
      email_notifications: emailNotifications,
      sms_notifications: smsNotifications,
      default_notification_minutes: defaultNotificationMinutes,
    });

    // Also update notification settings
    await updateNotificationSettings.mutateAsync({
      email_notifications_enabled: emailNotifications,
      sms_notifications_enabled: smsNotifications,
      sms_phone_number: phoneNumber,
    });
  };

  const handleTestEmail = async () => {
    setIsTesting(prev => ({ ...prev, email: true }));
    try {
      const { error } = await supabase.functions.invoke('send-appointment-notifications', {
        body: { 
          test: true,
          channels: ['email'],
          message: 'Test email notification from your calendar app!'
        }
      });

      if (error) throw error;

      toast({
        title: "Test email sent!",
        description: "Check your email inbox for the test message",
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Failed to send test email",
        description: "Please check your SendGrid configuration",
        variant: "destructive"
      });
    } finally {
      setIsTesting(prev => ({ ...prev, email: false }));
    }
  };

  const handleTestSMS = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number first",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(prev => ({ ...prev, sms: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.functions.invoke('send-bulk-sms', {
        body: { 
          phoneNumbers: [phoneNumber],
          message: 'Test SMS notification from your calendar app! 📅',
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Test SMS sent!",
        description: "Check your phone for the test message",
      });
    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast({
        title: "Failed to send test SMS",
        description: "Please check your Twilio configuration",
        variant: "destructive"
      });
    } finally {
      setIsTesting(prev => ({ ...prev, sms: false }));
    }
  };

  if (isLoading) {
    return <div>Loading notification settings...</div>;
  }

  const isEmailConfigured = notificationSettings?.email_notifications_enabled;
  const isSMSConfigured = phoneNumber && notificationSettings?.sms_notifications_enabled;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure your personal settings for receiving appointment notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              type="tel"
            />
            <p className="text-sm text-muted-foreground">
              Required for SMS notifications. Include country code (e.g., +1 for US)
            </p>
          </div>

          <Separator />

          {/* Default Notification Timing */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Default Notification Timing
            </Label>
            <Select 
              value={defaultNotificationMinutes.toString()} 
              onValueChange={(value) => setDefaultNotificationMinutes(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
                <SelectItem value="1440">1 day before</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This will be the default timing for new appointment notifications
            </p>
          </div>

          <Separator />

          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                  {isEmailConfigured && <Badge variant="secondary" className="ml-2">Configured</Badge>}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email reminders for your appointments
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            {emailNotifications && (
              <div className="pl-6 space-y-3">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Email notifications are enabled!</strong>
                    <br />
                    You'll receive email reminders for appointments with notifications enabled.
                    Emails are sent via your SendGrid integration.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleTestEmail}
                  disabled={isTesting.email}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {isTesting.email ? "Sending..." : "Send Test Email"}
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* SMS Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  SMS Notifications
                  {isSMSConfigured && <Badge variant="secondary" className="ml-2">Configured</Badge>}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive SMS reminders for your appointments
                </p>
              </div>
              <Switch
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
            </div>

            {smsNotifications && (
              <div className="pl-6 space-y-3">
                {phoneNumber ? (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      <strong>SMS notifications are enabled!</strong>
                      <br />
                      You'll receive SMS reminders at <strong>{phoneNumber}</strong> for appointments with notifications enabled.
                      Messages are sent via Twilio.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Phone number required!</strong>
                      <br />
                      Please enter your phone number above to receive SMS notifications.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleTestSMS}
                  disabled={isTesting.sms || !phoneNumber}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {isTesting.sms ? "Sending..." : "Send Test SMS"}
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {updateProfile.isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            How Notifications Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium">1</span>
              </div>
              <div>
                <h4 className="font-medium">Create Appointments with Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  When creating or editing appointments, enable notifications and choose your reminder timing.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium">2</span>
              </div>
              <div>
                <h4 className="font-medium">Automatic Scheduling</h4>
                <p className="text-sm text-muted-foreground">
                  Notifications are automatically scheduled based on your appointment time and chosen reminder period.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium">3</span>
              </div>
              <div>
                <h4 className="font-medium">Multi-Channel Delivery</h4>
                <p className="text-sm text-muted-foreground">
                  You'll receive reminders via email, SMS (if configured), and in-app notifications.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};