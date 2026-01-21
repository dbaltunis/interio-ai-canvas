import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Mail, Save, Loader2, Info, ExternalLink, Sparkles } from "lucide-react";
import { useEmailSettings, useUpdateEmailSettings } from "@/hooks/useEmailSettings";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useToast } from "@/hooks/use-toast";
import { TestEmailButton } from "@/components/email-setup/TestEmailButton";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { EmailTemplatesList } from "@/components/email-templates/EmailTemplatesList";
import { EmailPreview } from "@/components/email/EmailPreview";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const EmailSettingsTab = () => {
  const { data: emailSettings, isLoading } = useEmailSettings();
  const { data: businessSettings } = useBusinessSettings();
  const updateEmailSettings = useUpdateEmailSettings();
  const { toast } = useToast();
  const { hasSendGridIntegration } = useIntegrationStatus();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    from_email: emailSettings?.from_email || "",
    from_name: emailSettings?.from_name || "",
    reply_to_email: emailSettings?.reply_to_email || "",
    signature: emailSettings?.signature || "",
  });

  const [useAutoSignature, setUseAutoSignature] = useState(emailSettings?.use_auto_signature ?? true);
  const [showFooter, setShowFooter] = useState(emailSettings?.show_footer ?? true);

  // Generate auto signature from business settings
  const generateAutoSignature = () => {
    if (!businessSettings) return "Best regards,\nYour Company";
    
    let signature = "Best regards,\n";
    if (businessSettings.company_name) {
      signature += `${businessSettings.company_name}`;
    }
    return signature;
  };

  // Update form data when emailSettings loads
  useEffect(() => {
    if (emailSettings) {
      setFormData({
        from_email: emailSettings.from_email || "",
        from_name: emailSettings.from_name || "",
        reply_to_email: emailSettings.reply_to_email || "",
        signature: emailSettings.signature || "",
      });
      // Use database values for toggles, with sensible defaults
      setUseAutoSignature(emailSettings.use_auto_signature ?? !emailSettings.signature);
      setShowFooter(emailSettings.show_footer ?? true);
    }
  }, [emailSettings]);

  // When auto signature is toggled, update the signature field
  useEffect(() => {
    if (useAutoSignature) {
      setFormData(prev => ({ ...prev, signature: "" }));
    }
  }, [useAutoSignature]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.from_email && !hasSendGridIntegration) {
      // Use default for shared service
      formData.from_email = "noreply@interioapp.com";
    }
    
    if (!formData.from_name) {
      toast({
        title: "Validation Error",
        description: "From Name is a required field",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateEmailSettings.mutateAsync({
        ...formData,
        from_email: hasSendGridIntegration ? formData.from_email : "noreply@interioapp.com",
        // If using auto signature, save empty string to trigger auto-generation
        signature: useAutoSignature ? "" : formData.signature,
        use_auto_signature: useAutoSignature,
        show_footer: showFooter,
      });
    } catch (error) {
      console.error("Failed to update email settings:", error);
    }
  };

  // Get the effective signature for preview
  const effectiveSignature = useAutoSignature ? generateAutoSignature() : formData.signature;

  // Footer data from business settings (only show if footer is enabled)
  const footerData = showFooter ? {
    companyName: businessSettings?.company_name,
    phone: businessSettings?.business_phone,
    email: businessSettings?.business_email,
    website: businessSettings?.website,
    address: businessSettings?.address,
    city: businessSettings?.city,
    state: businessSettings?.state,
    country: businessSettings?.country,
  } : {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple header */}
      <div>
        <h2 className="text-2xl font-semibold mb-1">Email Settings</h2>
        <p className="text-muted-foreground">Configure sender information, signature, and footer for all outgoing emails</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Settings Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sender Information</CardTitle>
              <CardDescription>
                This is how your emails will appear to clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from_name">From Name *</Label>
                    <Input
                      id="from_name"
                      placeholder="Your Business Name"
                      value={formData.from_name}
                      onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="from_email">
                      From Email * 
                      {!hasSendGridIntegration && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">(Shared Service)</span>
                      )}
                    </Label>
                    <Input
                      id="from_email"
                      type="email"
                      placeholder="noreply@interioapp.com"
                      value={hasSendGridIntegration ? formData.from_email : "noreply@interioapp.com"}
                      onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                      disabled={!hasSendGridIntegration}
                      required
                    />
                    {!hasSendGridIntegration && (
                      <p className="text-xs text-muted-foreground">
                        Using shared email service. Configure custom SendGrid for branded sending.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reply_to_email">Reply-To Email (Optional)</Label>
                  <Input
                    id="reply_to_email"
                    type="email"
                    placeholder="support@yourdomain.com"
                    value={formData.reply_to_email}
                    onChange={(e) => setFormData({ ...formData, reply_to_email: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Where replies should be sent (defaults to From Email)
                  </p>
                </div>

                {/* Enhanced Signature Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="signature">Email Signature</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Your signature appears at the end of every email, before the footer.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="auto-signature"
                        checked={useAutoSignature} 
                        onCheckedChange={setUseAutoSignature}
                      />
                      <Label htmlFor="auto-signature" className="text-sm font-normal cursor-pointer">
                        Auto-generate
                      </Label>
                    </div>
                  </div>
                  
                  {useAutoSignature ? (
                    <Card className="bg-muted/50 border-dashed">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          Auto-generated from your Business Settings:
                        </p>
                        <pre className="text-sm whitespace-pre-line font-sans">{generateAutoSignature()}</pre>
                        <Button 
                          type="button"
                          variant="link" 
                          className="mt-2 h-auto p-0 text-xs"
                          onClick={() => navigate('/settings?tab=business')}
                        >
                          Edit in Business Settings <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Textarea
                      id="signature"
                      placeholder="Best regards,&#10;Your Name&#10;Your Business"
                      value={formData.signature}
                      onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                      rows={5}
                      className="font-mono text-sm"
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={updateEmailSettings.isPending}
                  >
                    {updateEmailSettings.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                  <TestEmailButton variant="outline" />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Email Footer Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Email Footer
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">The footer appears at the bottom of all emails with your business details.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                  <CardDescription>
                    {showFooter ? "Auto-generated from Business Settings" : "Footer is currently disabled"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    id="show-footer"
                    checked={showFooter} 
                    onCheckedChange={setShowFooter}
                  />
                  <Label htmlFor="show-footer" className="text-sm font-normal cursor-pointer">
                    {showFooter ? "Enabled" : "Disabled"}
                  </Label>
                </div>
              </div>
            </CardHeader>
            {showFooter && (
              <CardContent>
                {businessSettings?.company_name ? (
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg border border-dashed">
                      <div className="text-center space-y-1">
                        {businessSettings.company_name && (
                          <p className="font-medium text-sm">{businessSettings.company_name}</p>
                        )}
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {businessSettings.business_phone && (
                            <span>📞 {businessSettings.business_phone}</span>
                          )}
                          {businessSettings.business_email && (
                            <span>✉️ {businessSettings.business_email}</span>
                          )}
                          {businessSettings.website && (
                            <span>🌐 {businessSettings.website}</span>
                          )}
                        </div>
                        {businessSettings.address && (
                          <p className="text-xs text-muted-foreground">
                            📍 {[businessSettings.address, businessSettings.city, businessSettings.state, businessSettings.country].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/settings?tab=business')}
                    >
                      Edit in Business Settings <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground text-sm mb-3">
                      No business information configured yet.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/settings?tab=business')}
                    >
                      Set up Business Settings <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right Column: Live Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Live Email Preview</h3>
          </div>
          <EmailPreview
            fromName={formData.from_name || businessSettings?.company_name || "Your Business"}
            fromEmail={hasSendGridIntegration ? formData.from_email : "noreply@interioapp.com"}
            signature={effectiveSignature}
            footer={footerData}
            className="sticky top-4"
          />
          <p className="text-xs text-muted-foreground text-center">
            This preview shows how your emails will appear to recipients
          </p>
        </div>
      </div>

      {/* Email Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Customize email templates for quotes, bookings, and reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailTemplatesList />
        </CardContent>
      </Card>
    </div>
  );
};