import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, UserPlus, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProvisionResult {
  success: boolean;
  email?: string;
  temporaryPassword?: string;
  existingUser?: boolean;
  message?: string;
  error?: string;
}

export function ManualAccountProvision() {
  const [sessionId, setSessionId] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [result, setResult] = useState<ProvisionResult | null>(null);

  const handleProvision = async (mode: 'session' | 'subscription') => {
    const id = mode === 'session' ? sessionId : subscriptionId;
    
    if (!id.trim()) {
      toast.error(`Please enter a Stripe ${mode === 'session' ? 'session' : 'subscription'} ID`);
      return;
    }

    setIsProvisioning(true);
    setResult(null);

    try {
      const body = mode === 'session' 
        ? { sessionId: id.trim() }
        : { subscriptionId: id.trim() };

      const { data, error } = await supabase.functions.invoke('provision-subscription-account', {
        body,
      });

      if (error) {
        setResult({ success: false, error: error.message });
        toast.error("Failed to provision account");
      } else if (data.error) {
        setResult({ success: false, error: data.error });
        toast.error(data.error);
      } else {
        setResult(data);
        toast.success(data.existingUser ? "Account already exists" : "Account provisioned successfully");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setResult({ success: false, error: errorMessage });
      toast.error("Failed to provision account");
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Manual Account Provisioning
        </CardTitle>
        <CardDescription>
          Use this to manually provision an account if a customer's subscription success page failed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subscription">By Subscription ID</TabsTrigger>
            <TabsTrigger value="session">By Session ID</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscription" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="subscription-id" className="sr-only">Stripe Subscription ID</Label>
                <Input
                  id="subscription-id"
                  placeholder="sub_..."
                  value={subscriptionId}
                  onChange={(e) => setSubscriptionId(e.target.value)}
                  disabled={isProvisioning}
                />
              </div>
              <Button onClick={() => handleProvision('subscription')} disabled={isProvisioning || !subscriptionId.trim()}>
                {isProvisioning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Provisioning...
                  </>
                ) : (
                  "Provision Account"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Find the Subscription ID in Stripe Dashboard → Subscriptions → Click on subscription.
              For Sadath: <code className="bg-muted px-1 rounded">sub_1SnIGCBgcx5218GhV9BSSTt9</code>
            </p>
          </TabsContent>

          <TabsContent value="session" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="session-id" className="sr-only">Stripe Session ID</Label>
                <Input
                  id="session-id"
                  placeholder="cs_live_... or cs_test_..."
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  disabled={isProvisioning}
                />
              </div>
              <Button onClick={() => handleProvision('session')} disabled={isProvisioning || !sessionId.trim()}>
                {isProvisioning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Provisioning...
                  </>
                ) : (
                  "Provision Account"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Find the Session ID in Stripe Dashboard → Payments → Click on payment → "Checkout Session".
            </p>
          </TabsContent>
        </Tabs>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {result.success 
                ? (result.existingUser ? "Account Already Exists" : "Account Provisioned")
                : "Provisioning Failed"
              }
            </AlertTitle>
            <AlertDescription>
              {result.success ? (
                <div className="mt-2 space-y-2">
                  <p><strong>Email:</strong> {result.email}</p>
                  {result.temporaryPassword && (
                    <p><strong>Temporary Password:</strong> <code className="bg-muted px-2 py-1 rounded">{result.temporaryPassword}</code></p>
                  )}
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                </div>
              ) : (
                <p>{result.error}</p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
