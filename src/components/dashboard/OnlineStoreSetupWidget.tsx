import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Rocket, ExternalLink } from "lucide-react";
import { QuickStoreSetup } from "@/components/online-store/QuickStoreSetup";
import { ShopifyIntegrationDialog } from "@/components/library/ShopifyIntegrationDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const OnlineStoreSetupWidget = () => {
  const [showStoreSetup, setShowStoreSetup] = useState(false);
  const [showShopifyDialog, setShowShopifyDialog] = useState(false);
  const navigate = useNavigate();

  // Check if user already has an online store
  const { data: hasStore, isLoading } = useQuery({
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

  // Show skeleton while loading
  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-16 w-full bg-muted animate-pulse rounded-lg" />
            <div className="h-16 w-full bg-muted animate-pulse rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user already has a store, show a link to manage it
  if (hasStore) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-background">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Store className="h-4 w-4 text-primary" />
            Your Online Store
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Store className="h-10 w-10 mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground mb-4">
              Manage your online store, products, and settings
            </p>
            <Button 
              onClick={() => navigate('/?tab=online-store')}
              className="w-full"
            >
              Manage Store
              <Store className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-background">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Store className="h-4 w-4 text-primary" />
            Start Selling Online
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose how you want to sell your products online
            </p>
            
            <div className="grid gap-3">
              {/* Launch New Store */}
              <Button 
                onClick={() => setShowStoreSetup(true)}
                className="w-full justify-start h-auto py-4 px-4"
                variant="default"
              >
                <div className="flex items-start gap-3 text-left w-full">
                  <Rocket className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold mb-1">Launch New Store</div>
                    <div className="text-xs opacity-90 font-normal">
                      Create a custom online store with zero fees
                    </div>
                  </div>
                </div>
              </Button>

              {/* Connect Shopify */}
              <Button 
                onClick={() => setShowShopifyDialog(true)}
                variant="outline"
                className="w-full justify-start h-auto py-4 px-4"
              >
                <div className="flex items-start gap-3 text-left w-full">
                  <ExternalLink className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold mb-1">Connect Shopify</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      Sync your existing Shopify store
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Setup Flow */}
      <QuickStoreSetup 
        open={showStoreSetup}
        onOpenChange={setShowStoreSetup}
        onComplete={() => {
          setShowStoreSetup(false);
          // Refetch to update the widget
          navigate('/?tab=online-store');
        }}
      />

      {/* Shopify Integration Dialog */}
      <ShopifyIntegrationDialog 
        open={showShopifyDialog}
        onOpenChange={setShowShopifyDialog}
      />
    </>
  );
};
