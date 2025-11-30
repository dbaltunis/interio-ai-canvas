import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TestTube, Send, CheckCircle, AlertCircle, ChevronDown, Loader2 } from "lucide-react";
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
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
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
      setIsCustomizeOpen(false);
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Send Test Email
          </DialogTitle>
          <DialogDescription>
            Verify your email configuration is working
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Success/Error State - Prominent Display */}
          {testResult && (
            <div className={`rounded-lg p-4 ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`flex items-start gap-3 ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {testResult.success ? (
                  <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-base">
                    {testResult.success ? 'Email Sent Successfully!' : 'Email Failed'}
                  </p>
                  <p className="text-sm mt-1">{testResult.message}</p>
                  {testResult.success && (
                    <p className="text-xs mt-2 opacity-75">Check your inbox in a few moments</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Primary Email Input */}
          <div>
            <Label htmlFor="test_email">Email Address</Label>
            <Input
              id="test_email"
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="mt-1.5"
            />
            {emailSettings?.from_name && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Sending from: {emailSettings.from_name}
              </p>
            )}
          </div>

          {/* Collapsible Advanced Options */}
          <Collapsible open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between px-0 h-auto py-2 text-sm text-muted-foreground hover:text-foreground">
                <span>Customize Message (optional)</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isCustomizeOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div>
                <Label htmlFor="test_subject" className="text-xs">Subject</Label>
                <Input
                  id="test_subject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="test_message" className="text-xs">Message (HTML)</Label>
                <Textarea
                  id="test_message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={6}
                  className="font-mono text-xs mt-1"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={sendTestEmail}
              disabled={isSending || !testEmail.trim()}
              className="flex-1"
              size="lg"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} size="lg">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};