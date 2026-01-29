import { useState, useEffect } from "react";
import { Bell, Mail, MessageSquare, Smartphone, Clock, Volume2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNotificationPreferences, useUpdateNotificationPreferences, NotificationPreferences } from "@/hooks/useNotificationPreferences";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { key: "project", label: "Projects", description: "New projects, assignments, and updates" },
  { key: "appointment", label: "Appointments", description: "Meeting reminders and schedule changes" },
  { key: "quote", label: "Quotes", description: "Quote approvals, rejections, and updates" },
  { key: "team", label: "Team", description: "@mentions and team activity" },
  { key: "system", label: "System", description: "Account and security notifications" },
];

const DIGEST_FREQUENCIES = [
  { value: "never", label: "Never" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export const NotificationSettingsPanel = () => {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const [localPrefs, setLocalPrefs] = useState<Partial<NotificationPreferences>>({
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    digest_frequency: "never",
    digest_day: "monday",
    digest_time: "09:00",
    category_preferences: {
      project: true,
      appointment: true,
      quote: true,
      team: true,
      system: true,
    },
    quiet_hours_enabled: false,
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00",
  });

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleSave = () => {
    updatePreferences.mutate(localPrefs);
  };

  const updateField = <K extends keyof NotificationPreferences>(
    field: K,
    value: NotificationPreferences[K]
  ) => {
    setLocalPrefs((prev) => ({ ...prev, [field]: value }));
  };

  const updateCategoryPref = (category: string, enabled: boolean) => {
    setLocalPrefs((prev) => ({
      ...prev,
      category_preferences: {
        ...(prev.category_preferences as Record<string, boolean>),
        [category]: enabled,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const categoryPrefs = localPrefs.category_preferences as Record<string, boolean> || {};

  return (
    <div className="space-y-6">
      {/* Delivery Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Email notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              checked={localPrefs.email_enabled}
              onCheckedChange={(checked) => updateField("email_enabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Browser notifications</Label>
                <p className="text-sm text-muted-foreground">Show desktop notifications</p>
              </div>
            </div>
            <Switch
              checked={localPrefs.push_enabled}
              onCheckedChange={(checked) => updateField("push_enabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>SMS notifications</Label>
                <p className="text-sm text-muted-foreground">Receive text messages (coming soon)</p>
              </div>
            </div>
            <Switch
              checked={localPrefs.sms_enabled}
              onCheckedChange={(checked) => updateField("sms_enabled", checked)}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notification Categories
          </CardTitle>
          <CardDescription>
            Control which types of notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="flex items-center justify-between">
              <div>
                <Label>{cat.label}</Label>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </div>
              <Switch
                checked={categoryPrefs[cat.key] !== false}
                onCheckedChange={(checked) => updateCategoryPref(cat.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Email Digest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Digest
          </CardTitle>
          <CardDescription>
            Get a summary of your notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Frequency</Label>
              <Select
                value={localPrefs.digest_frequency as string}
                onValueChange={(v) => updateField("digest_frequency", v as NotificationPreferences["digest_frequency"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIGEST_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {localPrefs.digest_frequency === "weekly" && (
              <div>
                <Label>Day</Label>
                <Select
                  value={localPrefs.digest_day}
                  onValueChange={(v) => updateField("digest_day", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {localPrefs.digest_frequency !== "never" && (
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={localPrefs.digest_time || "09:00"}
                  onChange={(e) => updateField("digest_time", e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Pause notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable quiet hours</Label>
            <Switch
              checked={localPrefs.quiet_hours_enabled}
              onCheckedChange={(checked) => updateField("quiet_hours_enabled", checked)}
            />
          </div>

          {localPrefs.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start time</Label>
                <Input
                  type="time"
                  value={localPrefs.quiet_hours_start || "22:00"}
                  onChange={(e) => updateField("quiet_hours_start", e.target.value)}
                />
              </div>
              <div>
                <Label>End time</Label>
                <Input
                  type="time"
                  value={localPrefs.quiet_hours_end || "08:00"}
                  onChange={(e) => updateField("quiet_hours_end", e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updatePreferences.isPending}>
          {updatePreferences.isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
};
