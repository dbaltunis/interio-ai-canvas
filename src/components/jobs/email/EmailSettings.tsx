import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Mail, Key, Bell, Shield, Check, X, AlertTriangle } from "lucide-react";
import { useEmailSettings, useUpdateEmailSettings } from "@/hooks/useEmailSettings";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useState, useEffect } from "react";
import { EmailSetupStatusCard } from "@/components/email-setup/EmailSetupStatusCard";
import { TestEmailButton } from "@/components/email-setup/TestEmailButton";

export const EmailSettings = () => {
  const { data: emailSettings } = useEmailSettings();
  const { hasSendGridIntegration, integrationData } = useIntegrationStatus();
  const updateEmailSettings = useUpdateEmailSettings();

  const [formData, setFormData] = useState({
    from_email: "",
    from_name: "",
    reply_to_email: "",
    signature: "",
    active: true
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (emailSettings) {
      setFormData({
        from_email: emailSettings.from_email || "",
        from_name: emailSettings.from_name || "",
        reply_to_email: emailSettings.reply_to_email || "",
        signature: emailSettings.signature || "",
        active: emailSettings.active
      });
    }
  }, [emailSettings]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.from_email.trim()) {
      errors.from_email = "From email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.from_email)) {
      errors.from_email = "Please enter a valid email address";
    }
    
    if (!formData.from_name.trim()) {
      errors.from_name = "From name is required";
    }
    
    if (formData.reply_to_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.reply_to_email)) {
      errors.reply_to_email = "Please enter a valid reply-to email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    // Basic validation - only check required fields
    if (!formData.from_email.trim() || !formData.from_name.trim()) {
      console.error("From email and from name are required");
      return;
    }

    try {
      console.log("Saving email settings:", formData);
      await updateEmailSettings.mutateAsync({
        from_email: formData.from_email.trim(),
        from_name: formData.from_name.trim(),
        reply_to_email: formData.reply_to_email.trim() || undefined,
        signature: formData.signature.trim() || undefined,
        active: formData.active
      });
      console.log("Email settings saved successfully");
    } catch (error) {
      console.error("Failed to update email settings:", error);
    }
  };

  // Type guard to check if configuration has the expected structure
  const getConfigurationValue = (key: string): string | null => {
    if (!integrationData?.configuration || typeof integrationData.configuration !== 'object') {
      return null;
    }
    
    const config = integrationData.configuration as Record<string, any>;
    return config[key] || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Email Settings</h2>
          <p className="text-gray-600 text-sm mt-1">
            Configure your email preferences and integrations
          </p>
        </div>
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> For full email configuration, go to Settings → Email tab where all email setup is centralized.
          </AlertDescription>
        </Alert>
      </div>

      {/* Email Setup Status */}
      <EmailSetupStatusCard />

      {/* Sender Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Sender Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from_name">From Name *</Label>
              <Input
                id="from_name"
                value={formData.from_name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, from_name: e.target.value }));
                  if (formErrors.from_name) {
                    setFormErrors(prev => ({ ...prev, from_name: '' }));
                  }
                }}
                placeholder="Your Business Name"
                className={formErrors.from_name ? "border-red-500" : ""}
              />
              {formErrors.from_name && (
                <p className="text-sm text-red-500">{formErrors.from_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="from_email">From Email *</Label>
              <Input
                id="from_email"
                type="email"
                value={formData.from_email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, from_email: e.target.value }));
                  if (formErrors.from_email) {
                    setFormErrors(prev => ({ ...prev, from_email: '' }));
                  }
                }}
                placeholder="noreply@yourbusiness.com"
                className={formErrors.from_email ? "border-red-500" : ""}
              />
              {formErrors.from_email && (
                <p className="text-sm text-red-500">{formErrors.from_email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reply_to_email">Reply-To Email (Optional)</Label>
            <Input
              id="reply_to_email"
              type="email"
              value={formData.reply_to_email}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, reply_to_email: e.target.value }));
                if (formErrors.reply_to_email) {
                  setFormErrors(prev => ({ ...prev, reply_to_email: '' }));
                }
              }}
              placeholder="contact@yourbusiness.com"
              className={formErrors.reply_to_email ? "border-red-500" : ""}
            />
            {formErrors.reply_to_email && (
              <p className="text-sm text-red-500">{formErrors.reply_to_email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Email Signature</Label>
            <Textarea
              id="signature"
              value={formData.signature}
              onChange={(e) => setFormData(prev => ({ ...prev, signature: e.target.value }))}
              placeholder="Best regards,&#10;Your Name&#10;Your Business&#10;Phone: (555) 123-4567"
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
            />
            <Label htmlFor="active">Active email settings</Label>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSave}
              disabled={updateEmailSettings.isPending}
              className="flex-1 md:flex-none md:w-auto"
            >
              {updateEmailSettings.isPending ? "Saving..." : "Save Settings"}
            </Button>
            <TestEmailButton 
              variant="outline"
              className="flex-1 md:flex-none md:w-auto"
            />
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/settings?tab=email'}
              className="w-full md:w-auto"
            >
              Go to Full Email Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email delivery notifications</p>
                <p className="text-sm text-gray-600">Get notified when emails are delivered</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email open notifications</p>
                <p className="text-sm text-gray-600">Get notified when emails are opened</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Bounce notifications</p>
                <p className="text-sm text-gray-600">Get notified when emails bounce</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly email reports</p>
                <p className="text-sm text-gray-600">Receive weekly analytics summary</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable SPF/DKIM verification</p>
                <p className="text-sm text-gray-600">Improve email deliverability and security</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-300">
                <Check className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Track email opens</p>
                <p className="text-sm text-gray-600">Add tracking pixels to emails</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Track link clicks</p>
                <p className="text-sm text-gray-600">Track when links in emails are clicked</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label>Unsubscribe behavior</Label>
              <Select defaultValue="auto">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatic unsubscribe link</SelectItem>
                  <SelectItem value="manual">Manual unsubscribe handling</SelectItem>
                  <SelectItem value="custom">Custom unsubscribe page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
