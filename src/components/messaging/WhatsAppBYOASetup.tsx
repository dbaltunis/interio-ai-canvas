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
  ChevronUp
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const businessName = businessSettings?.company_name || 'InterioApp';
  const hasOwnNumber = settings?.use_own_account && settings.whatsapp_number;
  const senderNumber = hasOwnNumber ? settings.whatsapp_number : '+1 415 523 8886';

  const handleToggle = (checked: boolean) => {
    setUseOwnAccount(checked);
    setShowCredentials(checked);
    if (!checked) {
      saveMutation.mutate();
    }
  };

  return (
    <div className="space-y-4">
      {/* Simple Sender Display */}
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{businessName}</p>
                <p className="text-sm text-muted-foreground font-mono">{senderNumber}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
              <Check className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Use Own Number Toggle */}
      <Card>
        <CardContent className="py-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowCredentials(!showCredentials)}
          >
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Use Your Own WhatsApp Business Number</p>
                <p className="text-sm text-muted-foreground">Connect your Twilio account</p>
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
                  'Save'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
