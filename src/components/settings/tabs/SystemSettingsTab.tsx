
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Mail, Bell, Shield, Database, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useCompactMode } from "@/hooks/useCompactMode";
import { FeatureFlagsSettings } from "@/components/settings/FeatureFlagsSettings";

export const SystemSettingsTab = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    desktop: true,
    reminders: true,
  });
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { compact, toggleCompact } = useCompactMode();
  const [accent, setAccent] = useState<'primary' | 'secondary'>('primary');

  useEffect(() => {
    const existing = document.documentElement.getAttribute('data-accent') as 'primary' | 'secondary' | null;
    if (existing) setAccent(existing);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
  }, [accent]);

  return (
    <div className="space-y-6">
      {/* Feature Flags & Inventory Configuration */}
      <FeatureFlagsSettings />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Appearance
            </CardTitle>
            <CardDescription>
              Theme and density preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme ?? 'system'} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="apple-graphite">Graphite dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Current: {resolvedTheme} mode</p>
            </div>

            <div className="space-y-2">
              <Label>Accent color</Label>
              <Select value={accent} onValueChange={(v) => setAccent(v as 'primary' | 'secondary')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select accent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Brand Primary</SelectItem>
                  <SelectItem value="secondary">Brand Secondary</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Used for buttons, links and highlights</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  Compact mode
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] leading-none ${compact ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {compact ? 'ON' : 'OFF'}
                  </span>
                </Label>
                <p className="text-xs text-muted-foreground">Denser layout with tighter spacing</p>
              </div>
              <Switch checked={compact} onCheckedChange={() => toggleCompact()} />
            </div>
          </CardContent>
        </Card>

        {/* Language & Localization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language & Localization
            </CardTitle>
            <CardDescription>
              Configure language and regional settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>System Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select defaultValue="dd/mm/yyyy">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Zone</Label>
              <Select defaultValue="utc">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">Eastern Time</SelectItem>
                  <SelectItem value="pst">Pacific Time</SelectItem>
                  <SelectItem value="gmt">GMT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Templates
            </CardTitle>
            <CardDescription>
              Manage system email templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Welcome Email</span>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Quote Approval</span>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Installation Reminder</span>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Payment Reminder</span>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
            
            <Button className="w-full" variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Add Email Template
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch 
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive updates via SMS</p>
              </div>
              <Switch 
                checked={notifications.sms}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Desktop Notifications</Label>
                <p className="text-xs text-muted-foreground">Show browser notifications</p>
              </div>
              <Switch 
                checked={notifications.desktop}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, desktop: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Appointment Reminders</Label>
                <p className="text-xs text-muted-foreground">Remind about appointments</p>
              </div>
              <Switch 
                checked={notifications.reminders}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, reminders: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Terms & Conditions
          </CardTitle>
          <CardDescription>
            Manage your business terms and conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>General Terms & Conditions</Label>
            <Textarea 
              placeholder="Enter your general terms and conditions..."
              className="min-h-32"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Privacy Policy</Label>
            <Textarea 
              placeholder="Enter your privacy policy..."
              className="min-h-32"
            />
          </div>

          <div className="flex gap-2">
            <Button>Save Changes</Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Maintenance
          </CardTitle>
          <CardDescription>
            Database and system maintenance tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Database className="h-6 w-6 mb-2" />
              <span>Backup Database</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              <span>Export Data</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Shield className="h-6 w-6 mb-2" />
              <span>Security Audit</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
