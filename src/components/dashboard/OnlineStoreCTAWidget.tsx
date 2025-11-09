import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, ExternalLink, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import { OnlineStoreComparisonDialog } from "@/components/online-store/OnlineStoreComparisonDialog";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const OnlineStoreCTAWidget = () => {
  const [showComparison, setShowComparison] = useState(false);
  const navigate = useNavigate();

  // Check if user already has an online store
  const { data: hasStore } = useQuery({
    queryKey: ['has-online-store'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('online_stores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      return !!data;
    },
  });

  if (hasStore) {
    return null; // Don't show widget if user already has a store
  }

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-background">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Store className="h-5 w-5 text-primary" />
                Launch Your Online Store
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </CardTitle>
              <CardDescription>
                Start selling your window treatments online with zero commission fees
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Custom Online Store */}
            <div className="bg-background/50 backdrop-blur p-4 rounded-lg border border-primary/10">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                Custom Online Store
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                <li>✓ Full control & customization</li>
                <li>✓ Zero transaction fees</li>
                <li>✓ Built-in booking system</li>
                <li>✓ Custom domain support</li>
                <li>✓ Instant setup (5 minutes)</li>
              </ul>
              <Button 
                onClick={() => navigate('/?tab=online-store')}
                className="w-full"
              >
                Launch Store
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Shopify Integration */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Shopify Integration
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                <li>✓ Connect existing store</li>
                <li>✓ Sync inventory & orders</li>
                <li>✓ Keep your branding</li>
                <li>✓ Use existing customers</li>
                <li>✓ Marketing tools included</li>
              </ul>
              <Button 
                variant="outline"
                onClick={() => navigate('/?tab=inventory')}
                className="w-full"
              >
                Connect Shopify
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComparison(true)}
            className="w-full text-xs"
          >
            Compare Options →
          </Button>
        </CardContent>
      </Card>

      <OnlineStoreComparisonDialog
        open={showComparison}
        onOpenChange={setShowComparison}
      />
    </>
  );
};
