import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, Mail, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateEmailSettings } from "@/hooks/useEmailSettings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

type WizardStep = 'intro' | 'settings' | 'test' | 'complete';

export const EmailSetupWizard = ({ open, onOpenChange, onComplete }: EmailSetupWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('intro');
  const [emailSettings, setEmailSettingsState] = useState({
    from_email: 'noreply@interioapp.com',
    from_name: '',
    reply_to_email: '',
    signature: ''
  });
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const { mutateAsync: updateEmailSettings, isPending } = useUpdateEmailSettings();
  const { toast } = useToast();

  const steps: { id: WizardStep; title: string }[] = [
    { id: 'intro', title: 'Welcome' },
    { id: 'settings', title: 'Settings' },
    { id: 'test', title: 'Test' },
    { id: 'complete', title: 'Done' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const saveAndContinue = async () => {
    if (!emailSettings.from_name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your business name.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateEmailSettings({
        from_email: emailSettings.from_email,
        from_name: emailSettings.from_name.trim(),
        reply_to_email: emailSettings.reply_to_email.trim() || undefined,
        signature: emailSettings.signature.trim() || undefined,
        active: true
      });
      setCurrentStep('test');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const testEmailConfiguration = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Missing Email",
        description: "Please enter an email address to receive the test.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          to_email: testEmail,
          subject: 'Test Email - Setup Complete!',
          message: `
            <h2>🎉 Email Setup Successful!</h2>
            <p>Your email configuration is working correctly.</p>
            <p>You can now send emails to your customers.</p>
          `
        }
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent!",
        description: `Check your inbox at ${testEmail}`,
      });
      setCurrentStep('complete');
    } catch (error: any) {
      console.error('Test email error:', error);
      toast({
        title: "Test Email Failed",
        description: error.message || "Failed to send test email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleComplete = () => {
    onOpenChange(false);
    onComplete?.();
    // Reset wizard state
    setCurrentStep('intro');
    setEmailSettingsState({
      from_email: 'noreply@interioapp.com',
      from_name: '',
      reply_to_email: '',
      signature: ''
    });
    setTestEmail('');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Service Ready!</h3>
              <p className="text-muted-foreground">
                Your account includes email sending (500/month). Just configure your sender details and you're ready to go!
              </p>
            </div>
            <div className="space-y-2 bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span>No additional setup required</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span>500 emails/month included</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span>Ready in under 1 minute</span>
              </div>
            </div>
            <Button onClick={() => setCurrentStep('settings')} className="w-full" size="lg">
              Configure Sender Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Sender Information</h3>
              <p className="text-sm text-muted-foreground">
                This is how your emails will appear to clients
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="from_name">Business Name *</Label>
                <Input
                  id="from_name"
                  placeholder="Your Business Name"
                  value={emailSettings.from_name}
                  onChange={(e) => setEmailSettingsState({...emailSettings, from_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="reply_to_email">Reply-To Email (Optional)</Label>
                <Input
                  id="reply_to_email"
                  type="email"
                  placeholder="contact@yourbusiness.com"
                  value={emailSettings.reply_to_email}
                  onChange={(e) => setEmailSettingsState({...emailSettings, reply_to_email: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Where customer replies will be sent
                </p>
              </div>
              <div>
                <Label htmlFor="signature">Email Signature (Optional)</Label>
                <Textarea
                  id="signature"
                  placeholder="Best regards,&#10;Your Name&#10;Your Business"
                  value={emailSettings.signature}
                  onChange={(e) => setEmailSettingsState({...emailSettings, signature: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('intro')}>
                Back
              </Button>
              <Button 
                onClick={saveAndContinue} 
                className="flex-1"
                disabled={!emailSettings.from_name.trim() || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'test':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Test Your Setup</h3>
              <p className="text-sm text-muted-foreground">
                Send a test email to verify everything works
              </p>
            </div>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label htmlFor="test_email">Send test to:</Label>
                  <Input
                    id="test_email"
                    type="email"
                    placeholder="your@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>From:</strong> {emailSettings.from_name} &lt;noreply@interioapp.com&gt;
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('settings')}>
                Back
              </Button>
              <Button 
                onClick={testEmailConfiguration} 
                className="flex-1"
                disabled={isTestingEmail || !testEmail.trim()}
              >
                {isTestingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : 'Send Test Email'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setCurrentStep('complete')}
              >
                Skip
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Setup Complete!</h3>
              <p className="text-muted-foreground">
                Your email service is ready. You can now send quotes, confirmations, and notifications to your clients.
              </p>
            </div>
            <Card>
              <CardContent className="p-4 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Email service active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Sender: {emailSettings.from_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>500 emails/month included</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleComplete} className="w-full" size="lg">
              Done
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Setup
          </DialogTitle>
          <DialogDescription>
            Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.title}
          </DialogDescription>
        </DialogHeader>
        
        <Progress value={progress} className="h-1 mb-2" />
        
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};
