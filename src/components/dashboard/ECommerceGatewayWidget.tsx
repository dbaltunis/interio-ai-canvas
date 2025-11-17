import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, ShoppingBag, Plus, ArrowRight } from "lucide-react";
import { QuickStoreSetup } from "@/components/online-store/QuickStoreSetup";
import { ShopifyIntegrationDialog } from "@/components/library/ShopifyIntegrationDialog";
import { Skeleton } from "@/components/ui/skeleton";

export const ECommerceGatewayWidget = () => {
  const [showStoreSetup, setShowStoreSetup] = useState(false);
  const [showShopifyDialog, setShowShopifyDialog] = useState(false);
  const navigate = useNavigate();

  // Check if user has ANY InterioApp Online Store (published or draft)
  const { data: hasOnlineStore, isLoading: isLoadingStore } = useQuery({
    queryKey: ['has-online-store'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data, error } = await supabase
        .from('online_stores')
        .select('id, is_published')
        .eq('user_id', user.id)
        .limit(1);
      
      if (error) {
        console.error('[ECommerceGatewayWidget] Error fetching store:', error);
        return false;
      }
      
      console.log('[ECommerceGatewayWidget] Online store query result:', data);
      return data && data.length > 0;
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always', // Always refetch when component mounts
  });

  // Check if user has Shopify Integration
  const { integration: shopifyIntegration, isLoading: isLoadingShopify } = useShopifyIntegrationReal();
  const hasShopifyConnected = !!shopifyIntegration?.is_connected;

  const isLoading = isLoadingStore || isLoadingShopify;

  // Show skeleton while loading
  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-48 rounded" />
          </div>
          <Skeleton className="h-4 w-full rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Hide widget completely if user has already chosen a platform
  // They'll see platform-specific widgets instead
  if (hasOnlineStore || hasShopifyConnected) {
    return null;
  }

  // If user has neither - show choice
  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Start Selling Online</CardTitle>
          </div>
          <CardDescription>
            Choose how you want to start your e-commerce journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => setShowStoreSetup(true)}
            className="w-full justify-between group h-auto py-4"
            variant="outline"
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2 font-semibold">
                <Store className="h-4 w-4" />
                Launch New Store
              </div>
              <span className="text-xs text-muted-foreground font-normal">
                Create a custom online store with InterioApp
              </span>
            </div>
            <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </Button>
          
          <Button 
            onClick={() => setShowShopifyDialog(true)}
            className="w-full justify-between group h-auto py-4"
            variant="outline"
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2 font-semibold">
                <ShoppingBag className="h-4 w-4" />
                Connect Shopify
              </div>
              <span className="text-xs text-muted-foreground font-normal">
                Connect your existing Shopify store
              </span>
            </div>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>

      <QuickStoreSetup 
        open={showStoreSetup} 
        onOpenChange={setShowStoreSetup}
        onComplete={() => setShowStoreSetup(false)}
      />
      
      <ShopifyIntegrationDialog
        open={showShopifyDialog}
        onOpenChange={setShowShopifyDialog}
      />
    </>
  );
};
