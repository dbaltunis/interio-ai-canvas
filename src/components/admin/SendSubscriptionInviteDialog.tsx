import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SendSubscriptionInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendSubscriptionInviteDialog({ open, onOpenChange }: SendSubscriptionInviteDialogProps) {
  const [email, setEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [planKey, setPlanKey] = useState("starter");
  const [seats, setSeats] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch subscription plans from database
  const { data: plans = [] } = useQuery({
    queryKey: ['subscription-plans-for-invite'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id, name, price_monthly')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });
      
      if (error) throw error;
      return data.map(plan => ({
        key: plan.name.toLowerCase().replace(/\s+/g, '_'),
        name: plan.name,
        price: `£${plan.price_monthly}/month`,
        pricePerSeat: plan.price_monthly
      }));
    },
  });

  // Get current plan's price per seat for display
  const currentPlan = plans.find(p => p.key === planKey);
  const pricePerSeat = currentPlan?.pricePerSeat || 99;

  const handleSendInvite = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter the client's email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-subscription-invite", {
        body: { email, planKey, seats, clientName },
      });

      if (error) throw error;

      setCheckoutUrl(data.checkoutUrl);
      toast({
        title: "Invite Created!",
        description: data.message || "Checkout link generated successfully.",
      });
    } catch (error) {
      console.error("Error sending invite:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (checkoutUrl) {
      await navigator.clipboard.writeText(checkoutUrl);
      toast({
        title: "Copied!",
        description: "Checkout link copied to clipboard.",
      });
    }
  };

  const resetForm = () => {
    setEmail("");
    setClientName("");
    setPlanKey("starter");
    setSeats(1);
    setCheckoutUrl(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Subscription Invite
          </DialogTitle>
          <DialogDescription>
            Invite a client to subscribe to a plan. They'll receive a checkout link via email.
          </DialogDescription>
        </DialogHeader>

        {checkoutUrl ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                ✓ Checkout link created for {email}
              </p>
              <div className="flex gap-2">
                <Input 
                  value={checkoutUrl} 
                  readOnly 
                  className="text-xs"
                />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" asChild>
                  <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={resetForm}>
                Send Another
              </Button>
              <Button className="flex-1" onClick={() => handleClose(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name (optional)</Label>
              <Input
                id="clientName"
                placeholder="John Smith"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Client Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Subscription Plan</Label>
              <Select value={planKey} onValueChange={setPlanKey}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plans.length > 0 ? (
                    plans.map((plan) => (
                      <SelectItem key={plan.key} value={plan.key}>
                        {plan.name} - {plan.price}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="starter">Starter - £99/month</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seats">Number of Users</Label>
              <Input
                id="seats"
                type="number"
                min={1}
                max={50}
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                Each additional user costs £{pricePerSeat}/month
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSendInvite} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invite
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}