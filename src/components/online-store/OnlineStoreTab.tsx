import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OnlineStore } from "@/types/online-store";
import { StoreCreationFlow } from "./StoreCreationFlow";
import { StoreDashboard } from "./StoreDashboard";
import { StoreProductManager } from "./StoreProductManager";
import { StorePageEditor } from "./StorePageEditor";
import { StoreSettingsTab } from "./StoreSettingsTab";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const OnlineStoreTab = () => {
  const [showCreationFlow, setShowCreationFlow] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'products' | 'pages' | 'settings'>('dashboard');

  const { data: store, isLoading } = useQuery({
    queryKey: ['online-store'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('online_stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as OnlineStore | null;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <>
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Launch Your Online Store</CardTitle>
            <CardDescription>
              Create a beautiful online store in minutes. Showcase your products, accept inquiries, and grow your business.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Choose Template</h3>
                <p className="text-sm text-muted-foreground">
                  Select from 5 professionally designed templates
                </p>
              </div>
              <div className="text-center p-4">
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Customize Store</h3>
                <p className="text-sm text-muted-foreground">
                  Add your branding, products, and content
                </p>
              </div>
              <div className="text-center p-4">
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Go Live</h3>
                <p className="text-sm text-muted-foreground">
                  Publish your store and start receiving inquiries
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={() => setShowCreationFlow(true)}>
                <Store className="h-5 w-5 mr-2" />
                Launch Online Store
              </Button>
            </div>
          </CardContent>
        </Card>

        <StoreCreationFlow
          open={showCreationFlow}
          onOpenChange={setShowCreationFlow}
          onComplete={() => {}}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {activeView === 'dashboard' ? (
        <StoreDashboard
          store={store}
          onEditPages={() => setActiveView('pages')}
          onManageProducts={() => setActiveView('products')}
          onViewSettings={() => setActiveView('settings')}
        />
      ) : activeView === 'products' ? (
        <>
          <Button variant="outline" onClick={() => setActiveView('dashboard')}>
            ← Back to Dashboard
          </Button>
          <StoreProductManager storeId={store.id} />
        </>
      ) : activeView === 'pages' ? (
        <StorePageEditor 
          storeId={store.id} 
          onBack={() => setActiveView('dashboard')} 
        />
      ) : (
        <StoreSettingsTab 
          store={store} 
          onBack={() => setActiveView('dashboard')} 
        />
      )}
    </div>
  );
};
