import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Mail, Check, Loader2, MessageSquare, Phone } from "lucide-react";
import { useEmailSettings, useUpdateEmailSettings } from "@/hooks/useEmailSettings";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useState, useEffect } from "react";
import { TestEmailButton } from "@/components/email-setup/TestEmailButton";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

export const EmailSettings = () => {
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
      {/* Sender Information - Clean, focused form */}
      <Card>
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

      {/* Info about custom domain */}
      {!hasSendGridIntegration && (
        <p className="text-sm text-muted-foreground">
          Want to send from your own domain? Configure SendGrid in Settings → Integrations.
        </p>
      )}

      {/* WhatsApp Sender Information */}
      <WhatsAppSenderCard />
    </div>
  );
};

// Simple WhatsApp sender info
const WhatsAppSenderCard = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  const { data: businessSettings } = useQuery({
    queryKey: ['business-settings', effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return null;
      const { data } = await supabase
        .from('business_settings')
        .select('company_name')
        .eq('user_id', effectiveOwnerId)
        .maybeSingle();
      return data;
    },
    enabled: !!effectiveOwnerId,
  });

  const { data: twilioSettings } = useQuery({
    queryKey: ['twilio-settings', effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return null;
      const { data } = await supabase
        .from('integration_settings')
        .select('configuration, active')
        .eq('account_owner_id', effectiveOwnerId)
        .eq('integration_type', 'twilio')
        .eq('active', true)
        .maybeSingle();
      return data;
    },
    enabled: !!effectiveOwnerId,
  });

  const config = twilioSettings?.configuration as { 
    twilio_phone_number?: string;
    account_sid?: string;
  } | null;

  const hasCustomTwilio = !!config?.account_sid && !!config?.twilio_phone_number;
  const senderNumber = hasCustomTwilio ? config?.twilio_phone_number : '+1 415 523 8886';
  const senderName = businessSettings?.company_name || 'InterioApp';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            WhatsApp Sender
          </CardTitle>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <Phone className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium">{senderName}</p>
            <p className="text-sm text-muted-foreground font-mono">{senderNumber}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
