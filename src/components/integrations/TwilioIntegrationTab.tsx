import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Phone, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useToast } from "@/hooks/use-toast";
import type { IntegrationType } from "@/types/integrations";

export const TwilioIntegrationTab = () => {
  const { integrations, createIntegration, updateIntegration, testConnection } = useIntegrations();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    account_sid: "",
    auth_token: "",
    phone_number: "",
    active: false,
  });
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const twilioIntegration = integrations.find(
    (integration) => integration.integration_type === "twilio"
  ) as any;

  useEffect(() => {
    if (twilioIntegration) {
      const apiCreds = twilioIntegration.api_credentials || {};
      const config = twilioIntegration.configuration || {};
      setFormData({
        account_sid: apiCreds.account_sid || "",
        auth_token: apiCreds.auth_token || "",
        phone_number: config.phone_number || "",
        active: twilioIntegration.active || false,
      });
    }
  }, [twilioIntegration]);

  const handleSave = async () => {
    if (!formData.account_sid || !formData.auth_token || !formData.phone_number) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const integrationData = {
        integration_type: "twilio" as const,
        api_credentials: {
          account_sid: formData.account_sid,
          auth_token: formData.auth_token,
        },
        configuration: {
          phone_number: formData.phone_number,
        },
        active: formData.active,
        last_sync: null,
      };

      if (twilioIntegration) {
        await updateIntegration.mutateAsync({
          id: twilioIntegration.id,
          updates: integrationData,
        });
      } else {
        await createIntegration.mutateAsync(integrationData);
      }
    } catch (error) {
      console.error("Error saving Twilio integration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!twilioIntegration) {
      toast({
        title: "Save Configuration First",
        description: "Please save your Twilio configuration before testing.",
        variant: "destructive",
      });
      return;
    }

    await testConnection.mutateAsync(twilioIntegration);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Add + prefix if not present
    if (digits && !value.startsWith('+')) {
      return '+' + digits;
    }
    
    return value;
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Twilio SMS Integration</CardTitle>
                <CardDescription>
                  Configure Twilio for SMS messaging capabilities
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {twilioIntegration?.active ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Enter your Twilio account credentials. You can find these in your Twilio Console.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account_sid">Account SID *</Label>
              <Input
                id="account_sid"
                placeholder="AC9ce55163ebdf4109113cda1c91592558"
                value={formData.account_sid}
                onChange={(e) => setFormData({ ...formData, account_sid: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Your Twilio Account SID (starts with AC)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth_token">Auth Token *</Label>
              <div className="relative">
                <Input
                  id="auth_token"
                  type={showAuthToken ? "text" : "password"}
                  placeholder="6836d36db4bc353e22f21daf4c594b4b"
                  value={formData.auth_token}
                  onChange={(e) => setFormData({ ...formData, auth_token: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowAuthToken(!showAuthToken)}
                >
                  {showAuthToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your Twilio Auth Token (keep this secure)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Twilio Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone_number"
                placeholder="+17348021739"
                value={formData.phone_number}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  phone_number: formatPhoneNumber(e.target.value)
                })}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your Twilio phone number in E.164 format (e.g., +17348021739)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Enable Twilio SMS Integration</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Saving..." : "Save Configuration"}
            </Button>
            {twilioIntegration && (
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={testConnection.isPending}
              >
                {testConnection.isPending ? "Testing..." : "Test Connection"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Card */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to set up your Twilio SMS integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
              </div>
              <div>
                <h4 className="font-medium">Create a Twilio Account</h4>
                <p className="text-sm text-muted-foreground">
                  Sign up for a Twilio account at{" "}
                  <a 
                    href="https://www.twilio.com/try-twilio" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:underline"
                  >
                    twilio.com
                  </a>
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
              </div>
              <div>
                <h4 className="font-medium">Get Your Credentials</h4>
                <p className="text-sm text-muted-foreground">
                  Find your Account SID and Auth Token in the{" "}
                  <a 
                    href="https://console.twilio.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:underline"
                  >
                    Twilio Console
                  </a>
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
              </div>
              <div>
                <h4 className="font-medium">Purchase a Phone Number</h4>
                <p className="text-sm text-muted-foreground">
                  Buy a phone number in the{" "}
                  <a 
                    href="https://console.twilio.com/us1/develop/phone-numbers/manage/incoming" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:underline"
                  >
                    Phone Numbers section
                  </a>
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
              </div>
              <div>
                <h4 className="font-medium">Configure Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Enter your credentials above and enable the integration
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};