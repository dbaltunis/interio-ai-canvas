import { Bell, Mail, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";

export const AppointmentNotificationSettings = () => {
  const { hasSendGridIntegration } = useIntegrationStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Appointment Notifications
        </CardTitle>
        <CardDescription>
          Automated reminders are sent for appointments with notifications enabled
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <Label className="font-medium">Email Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Automatic email notifications before appointments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasSendGridIntegration ? (
              <Badge variant="default" className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="secondary">Configure SendGrid</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <Label className="font-medium">In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Browser notifications for upcoming appointments
              </p>
            </div>
          </div>
          <Badge variant="default" className="bg-green-500">Active</Badge>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <p className="text-sm font-medium">Reminder Schedule</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>• 1 day before appointment</p>
            <p>• 1 hour before appointment</p>
            <p>• 30 minutes before appointment</p>
            <p>• 15 minutes before appointment</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Enable notifications when creating/editing appointments to receive reminders
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
