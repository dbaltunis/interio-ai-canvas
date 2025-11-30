import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Save, Loader2 } from "lucide-react";
import { useEmailSettings, useUpdateEmailSettings } from "@/hooks/useEmailSettings";
import { useToast } from "@/hooks/use-toast";
import { TestEmailButton } from "@/components/email-setup/TestEmailButton";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";

export const EmailSettingsTab = () => {
  const { data: emailSettings, isLoading } = useEmailSettings();
  const updateEmailSettings = useUpdateEmailSettings();
  const { toast } = useToast();
  const { hasSendGridIntegration } = useIntegrationStatus();

  const [formData, setFormData] = useState({
    from_email: emailSettings?.from_email || "",
    from_name: emailSettings?.from_name || "",
    reply_to_email: emailSettings?.reply_to_email || "",
    signature: emailSettings?.signature || "",
  });

  // Update form data when emailSettings loads
  useEffect(() => {
    if (emailSettings) {
      setFormData({
        from_email: emailSettings.from_email || "",
        from_name: emailSettings.from_name || "",
        reply_to_email: emailSettings.reply_to_email || "",
        signature: emailSettings.signature || "",
      });
    }
  }, [emailSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.from_email || !formData.from_name) {
      toast({
        title: "Validation Error",
        description: "From Email and From Name are required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateEmailSettings.mutateAsync(formData);
    } catch (error) {
      console.error("Failed to update email settings:", error);
    }
  };

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
        <p className="text-muted-foreground">Configure your sender information for outgoing emails</p>
      </div>

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

            <div className="space-y-2">
              <Label htmlFor="signature">Email Signature (Optional)</Label>
              <Textarea
                id="signature"
                placeholder="Best regards,&#10;Your Name&#10;Your Business"
                value={formData.signature}
                onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                rows={4}
              />
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
    </div>
  );
};