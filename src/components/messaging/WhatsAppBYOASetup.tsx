import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  MessageSquare, 
  Check, 
  Loader2, 
  Phone,
  ChevronDown,
  ChevronUp,
  ExternalLink
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
  const [showCredentials, setShowCredentials] = useState(false);
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Fetch business settings for company name
  const { data: businessSettings } = useQuery({
    queryKey: ['whatsapp-business-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('business_settings')
        .select('company_name')
        .eq('user_id', user.id)
        .maybeSingle();

      return data;
    }
  });

  // Fetch existing settings - use account owner for sub-user support
  const { data: settings, isLoading } = useQuery({
    queryKey: ['whatsapp-user-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get account owner ID for sub-user support
      const { data: accountOwnerId } = await supabase.rpc('get_account_owner', { 
        user_id_param: user.id 
      });

      const { data, error } = await supabase
        .from('whatsapp_user_settings')
        .select('*')
        .eq('user_id', accountOwnerId || user.id)
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
        if (data.use_own_account) setShowCredentials(true);
      }

      return data as WhatsAppUserSettings | null;
    }
  });

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const hasCredentials = !!(useOwnAccount && accountSid && authToken && whatsappNumber);
      const settingsData = {
        user_id: user.id,
        use_own_account: useOwnAccount,
        account_sid: useOwnAccount ? accountSid : null,
        auth_token: useOwnAccount ? authToken : null,
        whatsapp_number: useOwnAccount ? whatsappNumber : null,
        verified: hasCredentials,
        verified_at: hasCredentials ? new Date().toISOString() : null,
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const businessName = businessSettings?.company_name || 'Your Business';
  const hasOwnNumber = settings?.use_own_account && settings.whatsapp_number && settings.verified;
  const isConfigured = settings?.use_own_account && settings.whatsapp_number;

  const handleToggle = (checked: boolean) => {
    setUseOwnAccount(checked);
    setShowCredentials(checked);
    if (!checked) {
      saveMutation.mutate();
    }
  };

  // Not configured - show setup prompt
  if (!isConfigured) {
    return (
      <div className="space-y-4">
        {/* Setup Required Card */}
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
                <MessageSquare className="h-6 w-6 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Connect WhatsApp Business</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  WhatsApp messaging requires a Twilio account with WhatsApp Business API enabled.
                  Connect your Twilio credentials to start sending WhatsApp messages to clients.
                </p>
              </div>
              <a 
                href="https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Get started with Twilio WhatsApp
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Setup Form */}
        <Card>
          <CardContent className="py-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowCredentials(!showCredentials)}
            >
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Connect Your Twilio Account</p>
                  <p className="text-sm text-muted-foreground">Enter your WhatsApp Business credentials</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={useOwnAccount} 
                  onCheckedChange={handleToggle}
                  onClick={(e) => e.stopPropagation()}
                />
                {showCredentials ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {showCredentials && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <div className="grid gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="accountSid" className="text-sm">Account SID</Label>
                    <Input
                      id="accountSid"
                      placeholder="ACxxxxxxxx..."
                      value={accountSid}
                      onChange={(e) => setAccountSid(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="authToken" className="text-sm">Auth Token</Label>
                    <Input
                      id="authToken"
                      type="password"
                      placeholder="••••••••"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="whatsappNumber" className="text-sm">WhatsApp Number</Label>
                    <Input
                      id="whatsappNumber"
                      placeholder="+1234567890"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Twilio WhatsApp-enabled phone number
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || !accountSid || !authToken || !whatsappNumber}
                  size="sm"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save & Connect'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Configured - show status and edit option
  return (
    <div className="space-y-4">
      {/* Connected Status */}
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{businessName}</p>
                <p className="text-sm text-muted-foreground font-mono">{settings?.whatsapp_number}</p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="bg-green-100 text-green-700 border-green-200"
            >
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Edit Credentials */}
      <Card>
        <CardContent className="py-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowCredentials(!showCredentials)}
          >
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Edit Twilio Credentials</p>
                <p className="text-sm text-muted-foreground">Update your WhatsApp Business settings</p>
              </div>
            </div>
            {showCredentials ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {showCredentials && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label htmlFor="accountSid" className="text-sm">Account SID</Label>
                  <Input
                    id="accountSid"
                    placeholder="ACxxxxxxxx..."
                    value={accountSid}
                    onChange={(e) => setAccountSid(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="authToken" className="text-sm">Auth Token</Label>
                  <Input
                    id="authToken"
                    type="password"
                    placeholder="••••••••"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="whatsappNumber" className="text-sm">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    placeholder="+1234567890"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                </div>
              </div>

              {settings?.verified && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Verified
                </p>
              )}

              <Button 
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !accountSid || !authToken || !whatsappNumber}
                size="sm"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
