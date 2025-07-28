import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { TestTube, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmailSettings } from "@/hooks/useEmailSettings";
import { supabase } from "@/integrations/supabase/client";

interface TestEmailButtonProps {
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export const TestEmailButton = ({ variant = "outline", size = "default", className }: TestEmailButtonProps) => {
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [customSubject, setCustomSubject] = useState('Test Email from Your App');
  const [customMessage, setCustomMessage] = useState(`
    <h2>Test Email Successful!</h2>
    <p>This is a test email to verify your email configuration is working correctly.</p>
    <p>If you're receiving this email, it means:</p>
    <ul>
      <li>✅ SendGrid integration is active</li>
      <li>✅ Your sender email is verified</li>
      <li>✅ Email settings are configured properly</li>
    </ul>
    <p>You can now confidently send emails to your customers.</p>
  `);

  const { data: emailSettings } = useEmailSettings();
  const { toast } = useToast();

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Missing Email Address",
        description: "Please enter a test email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          to_email: testEmail,
          subject: customSubject,
          message: customMessage
        }
      });

      if (error) {
        throw error;
      }

      setTestResult({
        success: true,
        message: `Test email sent successfully to ${testEmail}`
      });

      toast({
        title: "Test Email Sent!",
        description: `Check the inbox at ${testEmail}`,
        variant: "default"
      });

    } catch (error: any) {
      console.error('Test email error:', error);
      const errorMessage = error.message || 'Failed to send test email';
      
      setTestResult({
        success: false,
        message: errorMessage
      });

      toast({
        title: "Test Email Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      setTestResult(null);
      setTestEmail('');
      setCustomSubject('Test Email from Your App');
      setCustomMessage(`
        <h2>Test Email Successful!</h2>
        <p>This is a test email to verify your email configuration is working correctly.</p>
        <p>If you're receiving this email, it means:</p>
        <ul>
          <li>✅ SendGrid integration is active</li>
          <li>✅ Your sender email is verified</li>
          <li>✅ Email settings are configured properly</li>
        </ul>
        <p>You can now confidently send emails to your customers.</p>
      `);
    }
  };

  // Pre-fill with user's email if available
  const defaultTestEmail = emailSettings?.from_email || '';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={!emailSettings?.from_email}
        >
          <TestTube className="h-4 w-4 mr-2" />
          Send Test Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>
            Test your email configuration by sending a sample email.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Configuration */}
          {emailSettings && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Current Email Settings</h4>
                <div className="text-sm space-y-1">
                  <div><strong>From:</strong> {emailSettings.from_name} &lt;{emailSettings.from_email}&gt;</div>
                  {emailSettings.reply_to_email && (
                    <div><strong>Reply-To:</strong> {emailSettings.reply_to_email}</div>
                  )}
                  {emailSettings.signature && (
                    <div><strong>Signature:</strong> Configured</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Email Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="test_email">Send Test Email To</Label>
              <Input
                id="test_email"
                type="email"
                placeholder="recipient@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the email address where you want to receive the test email
              </p>
            </div>

            <div>
              <Label htmlFor="test_subject">Subject</Label>
              <Input
                id="test_subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="test_message">Message (HTML)</Label>
              <Textarea
                id="test_message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can use HTML tags for formatting
              </p>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-2 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {testResult.success ? 'Success!' : 'Failed'}
                  </span>
                </div>
                <p className="text-sm mt-1">{testResult.message}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={sendTestEmail}
              disabled={isSending || !testEmail.trim()}
              className="flex-1"
            >
              {isSending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};