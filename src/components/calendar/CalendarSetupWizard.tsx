import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, ExternalLink, Copy, Check } from "lucide-react";
import { CalendarProvider } from "./CalendarProviderPresets";
import { useAddCalDAVAccount, useTestCalDAVConnection } from "@/hooks/useCalDAV";

interface CalendarSetupWizardProps {
  provider: CalendarProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CalendarSetupWizard = ({ 
  provider, 
  open, 
  onOpenChange, 
  onSuccess 
}: CalendarSetupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    account_name: "",
    email: "",
    username: "",
    password: "",
    server_url: ""
  });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const addAccount = useAddCalDAVAccount();
  const testConnection = useTestCalDAVConnection();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleProviderSelect = () => {
    if (!provider) return;
    
    setFormData(prev => ({
      ...prev,
      account_name: provider.name + " Calendar",
      server_url: provider.serverUrl,
      email: "",
      username: "",
      password: ""
    }));
    setCurrentStep(2);
  };

  const handleTestConnection = async () => {
    if (!provider) return;
    
    // Create a mock account for testing - we'll need to update the hook to handle this
    const testAccount = {
      id: "test",
      user_id: "test",
      account_name: formData.account_name,
      email: formData.email,
      username: formData.username,
      password_encrypted: formData.password, // For testing, we use plain password
      server_url: formData.server_url || provider.serverUrl,
      sync_enabled: true,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_sync_at: null,
      sync_token: null
    };
    
    try {
      await testConnection.mutateAsync(testAccount);
      setTestResult({ success: true, message: "Connection successful!" });
      setCurrentStep(4);
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : "Connection failed"
      });
    }
  };

  const handleFinalSetup = async () => {
    try {
      await addAccount.mutateAsync({
        ...formData,
        server_url: formData.server_url || provider?.serverUrl || ""
      });
      onSuccess();
      onOpenChange(false);
      // Reset state
      setCurrentStep(1);
      setFormData({
        account_name: "",
        email: "",
        username: "",
        password: "",
        server_url: ""
      });
      setTestResult(null);
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : "Setup failed"
      });
    }
  };

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Setup Instructions</h3>
              <p className="text-muted-foreground">
                Follow these steps to connect your {provider?.name} calendar
              </p>
            </div>
            
            {provider?.requiresAppPassword && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> You'll need to create an App Password for security. 
                  Don't use your regular account password.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {provider?.icon}
                  {provider?.name} Setup Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {provider?.setupInstructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="min-w-[24px] h-6 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div className="flex-1 flex items-center justify-between">
                      <p className="text-sm">{instruction}</p>
                      {instruction.includes("App Password") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(instruction, index)}
                          className="ml-2"
                        >
                          {copiedStep === index ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleProviderSelect} className="flex-1">
                I've completed these steps
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Account Details</h3>
              <p className="text-muted-foreground">
                Enter your {provider?.name} account information
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  placeholder="My Gmail Calendar"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={`your.email@${provider?.id === 'google' ? 'gmail.com' : provider?.id === 'icloud' ? 'icloud.com' : 'example.com'}`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value, username: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="password">
                  {provider?.requiresAppPassword ? "App Password" : "Password"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={provider?.requiresAppPassword ? "App password from step 3 above" : "Your account password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {provider?.requiresAppPassword && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Use the App Password you created, not your regular password
                  </p>
                )}
              </div>

              {provider?.id === 'custom' && (
                <div>
                  <Label htmlFor="server_url">CalDAV Server URL</Label>
                  <Input
                    id="server_url"
                    placeholder="https://caldav.example.com"
                    value={formData.server_url}
                    onChange={(e) => setFormData({ ...formData, server_url: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setCurrentStep(3)} 
                className="flex-1"
                disabled={!formData.email || !formData.password || !formData.account_name}
              >
                Test Connection
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Testing Connection</h3>
              <p className="text-muted-foreground">
                Verifying your {provider?.name} account credentials
              </p>
            </div>

            {testResult && (
              <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {!testResult ? (
                <>
                  <Button 
                    onClick={handleTestConnection} 
                    className="flex-1"
                    disabled={testConnection.isPending}
                  >
                    {testConnection.isPending ? "Testing..." : "Test Connection"}
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                </>
              ) : testResult.success ? (
                <Button onClick={() => setCurrentStep(4)} className="flex-1">
                  Continue
                </Button>
              ) : (
                <>
                  <Button onClick={handleTestConnection} className="flex-1">
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back to Edit
                  </Button>
                </>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to Connect!</h3>
              <p className="text-muted-foreground">
                Your {provider?.name} calendar is ready to be added to InteriorApp
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Account:</span>
                    <span className="text-sm font-medium">{formData.account_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="text-sm font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Provider:</span>
                    <span className="text-sm font-medium">{provider?.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button 
                onClick={handleFinalSetup} 
                className="flex-1"
                disabled={addAccount.isPending}
              >
                {addAccount.isPending ? "Adding Account..." : "Add Calendar Account"}
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {provider?.icon}
            Setup {provider?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep} of {totalSteps}</span>
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