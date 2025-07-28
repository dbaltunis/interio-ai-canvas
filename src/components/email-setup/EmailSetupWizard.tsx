import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, ExternalLink, ArrowRight, Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useEmailSettings, useUpdateEmailSettings } from "@/hooks/useEmailSettings";
import { useToast } from "@/hooks/use-toast";

interface EmailSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

type WizardStep = 'intro' | 'sendgrid' | 'apikey' | 'verification' | 'emailsettings' | 'test' | 'complete';

export const EmailSetupWizard = ({ open, onOpenChange, onComplete }: EmailSetupWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('intro');
  const [apiKey, setApiKey] = useState('');
  const [emailSettings, setEmailSettingsState] = useState({
    from_email: '',
    from_name: '',
    reply_to_email: '',
    signature: ''
  });
  const [copied, setCopied] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const { hasSendGridIntegration } = useIntegrationStatus();
  const { data: currentEmailSettings } = useEmailSettings();
  const { mutateAsync: updateEmailSettings } = useUpdateEmailSettings();
  const { toast } = useToast();

  const steps: { id: WizardStep; title: string }[] = [
    { id: 'intro', title: 'Welcome' },
    { id: 'sendgrid', title: 'SendGrid Account' },
    { id: 'apikey', title: 'API Key' },
    { id: 'verification', title: 'Email Verification' },
    { id: 'emailsettings', title: 'Email Settings' },
    { id: 'test', title: 'Test Email' },
    { id: 'complete', title: 'Complete' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const testEmailConfiguration = async () => {
    if (!emailSettings.from_email || !emailSettings.from_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required email settings first.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingEmail(true);
    try {
      // First save the email settings
      await updateEmailSettings({
        from_email: emailSettings.from_email,
        from_name: emailSettings.from_name,
        reply_to_email: emailSettings.reply_to_email,
        signature: emailSettings.signature,
        active: true
      });

      // Then send test email via edge function
      const response = await fetch('/api/send-test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: emailSettings.from_email,
          subject: 'Test Email - Configuration Successful',
          message: `
            <h2>Congratulations! Your email configuration is working.</h2>
            <p>This test email confirms that:</p>
            <ul>
              <li>✅ SendGrid integration is active</li>
              <li>✅ Your sender email is verified</li>
              <li>✅ Email settings are configured correctly</li>
            </ul>
            <p>You can now send emails to your customers.</p>
          `
        }),
      });

      if (response.ok) {
        toast({
          title: "Test Email Sent!",
          description: `Check your inbox at ${emailSettings.from_email}`,
          variant: "default"
        });
        setCurrentStep('complete');
      } else {
        const error = await response.text();
        toast({
          title: "Test Email Failed",
          description: error || "Failed to send test email. Please check your configuration.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Test email error:', error);
      toast({
        title: "Test Email Failed",
        description: "An error occurred while sending the test email.",
        variant: "destructive"
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Welcome to Email Setup</h3>
              <p className="text-muted-foreground">
                This wizard will guide you through setting up email functionality for your app.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Set up SendGrid integration</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Configure sender email verification</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Test email delivery</span>
              </div>
            </div>
            <Button onClick={() => setCurrentStep('sendgrid')} className="w-full">
              Get Started
            </Button>
          </div>
        );

      case 'sendgrid':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Create SendGrid Account</h3>
              <p className="text-muted-foreground mb-4">
                SendGrid is required for sending emails. If you don't have an account, create one now.
              </p>
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">Step 1</span>
                    <span className="text-sm">Sign up for SendGrid</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://signup.sendgrid.com/', '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Create SendGrid Account
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('intro')}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep('apikey')} className="flex-1">
                I have a SendGrid account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'apikey':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Get SendGrid API Key</h3>
              <p className="text-muted-foreground mb-4">
                Create an API key in your SendGrid dashboard with Full Access permissions.
              </p>
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">Step 1</span>
                    <span className="text-sm">Go to SendGrid API Keys page</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://app.sendgrid.com/settings/api_keys', '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open SendGrid API Keys
                  </Button>
                  <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded border">
                    <strong>Important:</strong> Create a new API key with "Full Access" permissions for email sending to work properly.
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('sendgrid')}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep('verification')} className="flex-1">
                I have my API key
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Verify Sender Email</h3>
              <p className="text-muted-foreground mb-4">
                Before sending emails, you must verify your sender email address in SendGrid.
              </p>
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">Step 1</span>
                    <span className="text-sm">Go to Sender Authentication</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://app.sendgrid.com/settings/sender_auth', '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Sender Authentication
                  </Button>
                  <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border">
                    <strong>Steps in SendGrid:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Click "Create New Sender" or "Single Sender Verification"</li>
                      <li>Enter your email address and company details</li>
                      <li>Check your email and click the verification link</li>
                      <li>Wait for "Verified" status to appear</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('apikey')}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep('emailsettings')} className="flex-1">
                Email is verified
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'emailsettings':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Configure Email Settings</h3>
              <p className="text-muted-foreground mb-4">
                Set up your sender information that will appear on outgoing emails.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="from_email">From Email Address *</Label>
                <Input
                  id="from_email"
                  type="email"
                  placeholder="support@yourcompany.com"
                  value={emailSettings.from_email}
                  onChange={(e) => setEmailSettingsState({...emailSettings, from_email: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">Must be verified in SendGrid</p>
              </div>
              <div>
                <Label htmlFor="from_name">From Name *</Label>
                <Input
                  id="from_name"
                  placeholder="Your Company Name"
                  value={emailSettings.from_name}
                  onChange={(e) => setEmailSettingsState({...emailSettings, from_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="reply_to_email">Reply-To Email (Optional)</Label>
                <Input
                  id="reply_to_email"
                  type="email"
                  placeholder="replies@yourcompany.com"
                  value={emailSettings.reply_to_email}
                  onChange={(e) => setEmailSettingsState({...emailSettings, reply_to_email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="signature">Email Signature (Optional)</Label>
                <Textarea
                  id="signature"
                  placeholder="Best regards,&#10;Your Name&#10;Your Company"
                  value={emailSettings.signature}
                  onChange={(e) => setEmailSettingsState({...emailSettings, signature: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('verification')}>
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep('test')} 
                className="flex-1"
                disabled={!emailSettings.from_email || !emailSettings.from_name}
              >
                Continue to Test
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'test':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Test Your Setup</h3>
              <p className="text-muted-foreground mb-4">
                Send a test email to verify everything is working correctly.
              </p>
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Test email will be sent to:</strong> {emailSettings.from_email}
                  </div>
                  <div className="text-sm">
                    <strong>From:</strong> {emailSettings.from_name} &lt;{emailSettings.from_email}&gt;
                  </div>
                  {emailSettings.reply_to_email && (
                    <div className="text-sm">
                      <strong>Reply-To:</strong> {emailSettings.reply_to_email}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('emailsettings')}>
                Back
              </Button>
              <Button 
                onClick={testEmailConfiguration} 
                className="flex-1"
                disabled={isTestingEmail}
              >
                {isTestingEmail ? 'Sending Test Email...' : 'Send Test Email'}
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
              <p className="text-muted-foreground mb-4">
                Your email functionality is now fully configured and ready to use.
              </p>
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>SendGrid integration active</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Sender email verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Email settings configured</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Test email sent successfully</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button 
              onClick={() => {
                onOpenChange(false);
                onComplete?.();
              }} 
              className="w-full"
            >
              Finish Setup
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Email Setup Wizard
          </DialogTitle>
          <DialogDescription>
            Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};