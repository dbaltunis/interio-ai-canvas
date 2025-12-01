import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Mail, Key, Bell, Shield, Check, X, AlertTriangle, Loader2 } from "lucide-react";
import { useEmailSettings, useUpdateEmailSettings } from "@/hooks/useEmailSettings";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useState, useEffect } from "react";
import { EmailSetupStatusCard } from "@/components/email-setup/EmailSetupStatusCard";
import { TestEmailButton } from "@/components/email-setup/TestEmailButton";
import { EmailSetupWizard } from "@/components/email-setup/EmailSetupWizard";
import { useToast } from "@/hooks/use-toast";

export const EmailSettings = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { data: emailSettings } = useEmailSettings();
  const { hasSendGridIntegration, integrationData } = useIntegrationStatus();
  const updateEmailSettings = useUpdateEmailSettings();
  const { toast } = useToast();

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
    setSaveSuccess(false);
    
    // Basic validation - only check required fields
    if (!formData.from_name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your business name.",
        variant: "destructive"
      });
      return;
    }

    // Use shared service email if no SendGrid integration
    const fromEmail = hasSendGridIntegration ? formData.from_email.trim() : "noreply@interioapp.com";

    try {
      console.log("Saving email settings:", { ...formData, from_email: fromEmail });
      await updateEmailSettings.mutateAsync({
        from_email: fromEmail,
        from_name: formData.from_name.trim(),
        reply_to_email: formData.reply_to_email.trim() || undefined,
        signature: formData.signature.trim() || undefined,
        active: formData.active
      });
      
      setSaveSuccess(true);
      toast({
        title: "Settings Saved",
        description: `Emails will be sent from "${formData.from_name.trim()}"`,
      });
      
      // Clear success indicator after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update email settings:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save email settings. Please try again.",
        variant: "destructive"
      });
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
      {/* Setup Progress Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Email Settings Card */}
        <Card className={emailSettings ? "border-green-200 bg-green-50/50" : "border-blue-200 bg-blue-50/50"}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {emailSettings ? (
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-sm">Email Settings</h3>
                  <p className="text-xs text-muted-foreground">Configure sender name, email, and signature</p>
                </div>
              </div>
              <Badge variant={emailSettings ? "default" : "secondary"} className={emailSettings ? "bg-green-100 text-green-800 border-green-200" : ""}>
                {emailSettings ? "Complete" : "Pending"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* SendGrid Premium Card */}
        <Card className="border-border bg-background">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Custom Domain (Optional Premium)</h3>
                <p className="text-xs text-muted-foreground">Use your own SendGrid for custom branding and unlimited sending. Configure in Settings → Integrations.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start Setup Wizard / Manual Setup Toggle */}
      {!emailSettings && (
        <div className="flex gap-3">
          <Button 
            className="flex-1 bg-primary text-white hover:bg-primary/90"
            size="lg"
            onClick={() => setWizardOpen(true)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Start Setup Wizard
          </Button>
          <Button 
            variant="outline"
            size="lg"
            onClick={() => {
              // Scroll to sender form
              document.getElementById('sender-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manual Setup
          </Button>
        </div>
      )}

      {/* Email Setup Wizard Dialog */}
      <EmailSetupWizard 
        open={wizardOpen} 
        onOpenChange={setWizardOpen}
        onComplete={() => setWizardOpen(false)}
      />

      {/* Sender Information - Primary Focus */}
      <Card id="sender-form">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Sender Information
            </CardTitle>
            {emailSettings && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Check className="h-3 w-3 mr-1" />
                Configured
              </Badge>
            )}
          </div>
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
                value={hasSendGridIntegration ? formData.from_email : "noreply@interioapp.com"}
                onChange={(e) => {
                  if (hasSendGridIntegration) {
                    setFormData(prev => ({ ...prev, from_email: e.target.value }));
                    if (formErrors.from_email) {
                      setFormErrors(prev => ({ ...prev, from_email: '' }));
                    }
                  }
                }}
                placeholder="noreply@interioapp.com"
                disabled={!hasSendGridIntegration}
                className={`${formErrors.from_email ? "border-red-500" : ""} ${!hasSendGridIntegration ? "bg-muted" : ""}`}
              />
              {!hasSendGridIntegration && (
                <p className="text-xs text-muted-foreground">Using shared email service. Configure SendGrid for custom domain.</p>
              )}
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

          <div className="flex gap-3 flex-wrap items-center">
            <Button 
              onClick={handleSave}
              disabled={updateEmailSettings.isPending}
              size="lg"
              className={`flex-1 md:flex-initial ${saveSuccess ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {updateEmailSettings.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
            <TestEmailButton 
              variant="outline"
              size="lg"
              className="flex-1 md:flex-initial"
            />
            {saveSuccess && (
              <span className="text-sm text-green-600 font-medium">
                ✓ Ready to send emails
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optional: Advanced Settings - Collapsed by default */}
      {emailSettings && (
        <details className="group">
          <summary className="cursor-pointer list-none">
            <Card className="transition-colors hover:border-primary/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold text-sm">Advanced Settings</h3>
                      <p className="text-xs text-muted-foreground">Notification preferences, security, and compliance options</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </summary>
          
          <div className="mt-4 space-y-4">
            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Email delivery notifications</p>
                    <p className="text-xs text-muted-foreground">Get notified when emails are delivered</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Email open notifications</p>
                    <p className="text-xs text-muted-foreground">Get notified when emails are opened</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Bounce notifications</p>
                    <p className="text-xs text-muted-foreground">Get notified when emails bounce</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Track email opens</p>
                    <p className="text-xs text-muted-foreground">Add tracking pixels to emails</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Track link clicks</p>
                    <p className="text-xs text-muted-foreground">Track when links in emails are clicked</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </details>
      )}
    </div>
  );
};
