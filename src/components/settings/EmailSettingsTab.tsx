
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Save, Loader2 } from "lucide-react";
import { useEmailSettings, useUpdateEmailSettings } from "@/hooks/useEmailSettings";
import { useToast } from "@/hooks/use-toast";

export const EmailSettingsTab = () => {
  const { data: emailSettings, isLoading } = useEmailSettings();
  const updateEmailSettings = useUpdateEmailSettings();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    from_email: emailSettings?.from_email || "",
    from_name: emailSettings?.from_name || "",
    reply_to_email: emailSettings?.reply_to_email || "",
    signature: emailSettings?.signature || "",
  });

  // Update form data when emailSettings loads
  useState(() => {
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>
              Configure your sender information for outgoing emails
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_email">From Email *</Label>
              <Input
                id="from_email"
                type="email"
                placeholder="your-email@yourdomain.com"
                value={formData.from_email}
                onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">
                This email must be verified in your SendGrid account
              </p>
            </div>
            
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="reply_to_email">Reply-To Email</Label>
            <Input
              id="reply_to_email"
              type="email"
              placeholder="replies@yourdomain.com"
              value={formData.reply_to_email}
              onChange={(e) => setFormData({ ...formData, reply_to_email: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Optional. If left empty, replies will go to the From Email
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Email Signature</Label>
            <Textarea
              id="signature"
              placeholder="Best regards,&#10;Your Name&#10;Your Business"
              value={formData.signature}
              onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            disabled={updateEmailSettings.isPending}
            className="w-full md:w-auto"
          >
            {updateEmailSettings.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Email Settings
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Your "From Email" must be verified in SendGrid as a Sender Identity</li>
            <li>• Configure SendGrid integration in the Integrations tab first</li>
            <li>• Test your email settings by sending a test email</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
