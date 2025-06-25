
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, AlertCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSendEmail } from "@/hooks/useSendEmail";

export const SendGridSetup = () => {
  const [testEmail, setTestEmail] = useState("");
  const [isConnected, setIsConnected] = useState(true); // Since API key is configured
  const { toast } = useToast();
  const sendEmailMutation = useSendEmail();

  const webhookUrl = `https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/sendgrid-webhook`;

  const handleTestEmail = () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive"
      });
      return;
    }

    sendEmailMutation.mutate({
      to: testEmail,
      subject: "SendGrid Integration Test",
      content: `
        <h2>SendGrid Integration Test</h2>
        <p>This is a test email to verify your SendGrid integration is working correctly.</p>
        <p>If you received this email, your SendGrid configuration is successful!</p>
        <hr>
        <p><small>Sent from InterioApp</small></p>
      `
    });
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copied",
      description: "Webhook URL copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>SendGrid Email Integration</CardTitle>
              <CardDescription>Configure email delivery and tracking</CardDescription>
            </div>
            <Badge className="ml-auto bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              SendGrid API key is configured and ready for use. You can now send emails through the system.
            </AlertDescription>
          </Alert>

          {/* Test Email Section */}
          <div className="space-y-3">
            <h4 className="font-medium">Test Email Delivery</h4>
            <div className="flex gap-3">
              <Input
                placeholder="Enter test email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                type="email"
              />
              <Button 
                onClick={handleTestEmail}
                disabled={sendEmailMutation.isPending}
              >
                {sendEmailMutation.isPending ? "Sending..." : "Send Test"}
              </Button>
            </div>
          </div>

          {/* Webhook Configuration */}
          <div className="space-y-3">
            <h4 className="font-medium">Webhook Configuration</h4>
            <p className="text-sm text-gray-600">
              Configure this webhook URL in SendGrid to receive email events (opens, clicks, bounces):
            </p>
            <div className="flex gap-2">
              <Input 
                value={webhookUrl} 
                readOnly 
                className="font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Go to SendGrid Dashboard → Settings → Mail Settings → Event Webhook</li>
                  <li>Add the webhook URL above</li>
                  <li>Enable events: Delivered, Opens, Clicks, Bounces, Drops</li>
                  <li>Set HTTP POST method and save</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>

          {/* Email Features */}
          <div className="space-y-3">
            <h4 className="font-medium">Available Features</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Email Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Open Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Click Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Bounce Handling</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Analytics Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Campaign Management</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
