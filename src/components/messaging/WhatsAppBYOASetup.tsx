import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageSquare, 
  Check, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Shield,
  Phone,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WhatsAppUserSettings {
  id: string;
  user_id: string;
  use_own_account: boolean;
  account_sid: string | null;
  auth_token: string | null;
  whatsapp_number: string | null;
  verified: boolean;
  verified_at: string | null;
}

export const WhatsAppBYOASetup = () => {
  const queryClient = useQueryClient();
  const [useOwnAccount, setUseOwnAccount] = useState(false);
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch existing settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['whatsapp-user-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('whatsapp_user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching WhatsApp settings:', error);
        return null;
      }

      if (data) {
        setUseOwnAccount(data.use_own_account);
        setAccountSid(data.account_sid || "");
        setAuthToken(data.auth_token || "");
        setWhatsappNumber(data.whatsapp_number || "");
      }

      return data as WhatsAppUserSettings | null;
    }
  });

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const settingsData = {
        user_id: user.id,
        use_own_account: useOwnAccount,
        account_sid: useOwnAccount ? accountSid : null,
        auth_token: useOwnAccount ? authToken : null,
        whatsapp_number: useOwnAccount ? whatsappNumber : null,
        verified: false,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('whatsapp_user_settings')
        .upsert(settingsData, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('WhatsApp settings saved');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-user-settings'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save settings');
    }
  });

  // Verify credentials by sending a test message
  const verifyCredentials = async () => {
    if (!accountSid || !authToken || !whatsappNumber) {
      toast.error('Please fill in all credentials first');
      return;
    }

    setIsVerifying(true);
    try {
      // Call edge function to verify
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: whatsappNumber, // Send to own number as test
          message: '✅ InterioApp WhatsApp integration verified successfully!',
          testMode: true
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Mark as verified
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('whatsapp_user_settings')
          .update({ 
            verified: true, 
            verified_at: new Date().toISOString() 
          })
          .eq('user_id', user.id);
      }

      toast.success('Credentials verified! Test message sent.');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-user-settings'] });
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Determine current sender display
  const getCurrentSenderInfo = () => {
    if (settings?.use_own_account && settings.whatsapp_number) {
      return {
        label: 'Your Business Number',
        number: settings.whatsapp_number,
        verified: settings.verified,
        isSandbox: false
      };
    }
    return {
      label: 'Twilio Sandbox',
      number: '+1 (415) 523-8886',
      verified: true,
      isSandbox: true
    };
  };

  const senderInfo = getCurrentSenderInfo();

  return (
    <div className="space-y-4">
      {/* Current Sender Status - Prominent Display */}
      <Card className={cn(
        "border",
        senderInfo.isSandbox 
          ? "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20" 
          : "border-green-200 bg-green-50/50 dark:bg-green-950/20"
      )}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                senderInfo.isSandbox 
                  ? "bg-amber-100 dark:bg-amber-900" 
                  : "bg-green-100 dark:bg-green-900"
              )}>
                <MessageSquare className={cn(
                  "h-5 w-5",
                  senderInfo.isSandbox ? "text-amber-600" : "text-green-600"
                )} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Messages sent from</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{senderInfo.label}</span>
                  <span className="text-sm text-muted-foreground">({senderInfo.number})</span>
                  {senderInfo.verified && (
                    <Check className={cn(
                      "h-4 w-4",
                      senderInfo.isSandbox ? "text-amber-600" : "text-green-600"
                    )} />
                  )}
                </div>
              </div>
            </div>
            <Badge variant="outline" className={cn(
              senderInfo.isSandbox 
                ? "bg-amber-100 text-amber-700 border-amber-200" 
                : "bg-green-100 text-green-700 border-green-200"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full mr-1.5 animate-pulse",
                senderInfo.isSandbox ? "bg-amber-500" : "bg-green-500"
              )} />
              {senderInfo.isSandbox ? "Sandbox" : "Ready"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sandbox Warning */}
      {senderInfo.isSandbox && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Twilio Sandbox Mode:</strong> Recipients must join the sandbox first to receive messages.
            <div className="mt-2 p-2 bg-amber-100/50 rounded text-xs space-y-1">
              <p className="font-medium">How to test:</p>
              <p>1. Have your recipient send <code className="bg-amber-200/50 px-1 rounded">join &lt;your-sandbox-code&gt;</code> to <strong>+1 415 523 8886</strong></p>
              <p>2. After joining, they can receive messages from your app</p>
              <a 
                href="https://www.twilio.com/docs/whatsapp/sandbox" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-700 hover:underline font-medium"
              >
                View sandbox setup guide <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            WhatsApp Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Choose how you want to send WhatsApp messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Option Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Use Your Own WhatsApp Business Number</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect your Twilio account with your own WhatsApp Business number
              </p>
            </div>
            <Switch 
              checked={useOwnAccount} 
              onCheckedChange={setUseOwnAccount}
            />
          </div>

          {!useOwnAccount && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Using InterioApp Shared Number</strong> - Messages will be sent from the InterioApp 
                business WhatsApp number. This is ready to use with no setup required.
              </AlertDescription>
            </Alert>
          )}

          {useOwnAccount && (
            <div className="space-y-6 pt-4 border-t">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need a <strong>Twilio account</strong> with a <strong>WhatsApp-enabled phone number</strong>. 
                  <a 
                    href="https://www.twilio.com/docs/whatsapp/quickstart" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-1 text-primary hover:underline"
                  >
                    Learn more <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountSid">Twilio Account SID</Label>
                  <Input
                    id="accountSid"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={accountSid}
                    onChange={(e) => setAccountSid(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Found in your Twilio Console dashboard
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authToken">Twilio Auth Token</Label>
                  <Input
                    id="authToken"
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Keep this secret! Found in your Twilio Console
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Business Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="whatsappNumber"
                      placeholder="+1234567890"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your Twilio WhatsApp-enabled number with country code
                  </p>
                </div>
              </div>

              {/* Verification Status */}
              {settings?.verified && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <Shield className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>Credentials verified and working</span>
                    {settings.verified_at && (
                      <span className="text-xs opacity-75">
                        (verified {new Date(settings.verified_at).toLocaleDateString()})
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || !accountSid || !authToken || !whatsappNumber}
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Credentials'
                  )}
                </Button>

                <Button 
                  variant="outline"
                  onClick={verifyCredentials}
                  disabled={isVerifying || !accountSid || !authToken || !whatsappNumber}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Test & Verify
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {!useOwnAccount && settings?.use_own_account && (
            <Button 
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              Switch to Shared Number
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Why Use Your Own Number?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Shared Number
                </Badge>
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ No setup required</li>
                <li>✓ Works immediately</li>
                <li>✓ Messages from "InterioApp"</li>
                <li>• Clients see shared number</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Your Own Number
                </Badge>
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Your business name & branding</li>
                <li>✓ Clients see your number</li>
                <li>✓ Can receive replies directly</li>
                <li>• Requires Twilio account</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
