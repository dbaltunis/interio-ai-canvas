import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OnlineStore } from "@/types/online-store";
import { QuickStoreSetup } from "./QuickStoreSetup";
import { StoreDashboard } from "./StoreDashboard";
import { ProductCatalogManager } from "./product-catalog/ProductCatalogManager";
import { StorePageEditor } from "./StorePageEditor";
import { StoreSettingsTab } from "./StoreSettingsTab";
import { StoreCategorySettings } from "./StoreCategorySettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Sparkles, Zap, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const OnlineStoreTab = () => {
  const [showCreationFlow, setShowCreationFlow] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'products' | 'pages' | 'settings' | 'categories'>('dashboard');

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
              Launch your store in 3 steps. Accept orders, bookings, and start selling immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Pick Template</h3>
                <p className="text-xs text-muted-foreground">
                  Choose your style in 10 seconds
                </p>
              </div>
              <div className="text-center p-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Auto-Setup</h3>
                <p className="text-xs text-muted-foreground">
                  Products & branding added automatically
                </p>
              </div>
              <div className="text-center p-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Book Appointments</h3>
                <p className="text-xs text-muted-foreground">
                  Built-in booking system included
                </p>
              </div>
              <div className="text-center p-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Instant Live</h3>
                <p className="text-xs text-muted-foreground">
                  Store published immediately
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Button size="lg" onClick={() => setShowCreationFlow(true)} className="text-lg px-8 py-6">
                <Zap className="h-6 w-6 mr-2" />
                Launch Store in 2 Minutes
              </Button>
            </div>
          </CardContent>
        </Card>

        <QuickStoreSetup
          open={showCreationFlow}
          onOpenChange={setShowCreationFlow}
          onComplete={() => setShowCreationFlow(false)}
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
          onManageCategories={() => setActiveView('categories')}
        />
      ) : activeView === 'products' ? (
        <>
          <Button variant="outline" onClick={() => setActiveView('dashboard')}>
            ← Back to Dashboard
          </Button>
          <ProductCatalogManager storeId={store.id} />
        </>
      ) : activeView === 'pages' ? (
        <StorePageEditor 
          storeId={store.id} 
          onBack={() => setActiveView('dashboard')} 
        />
      ) : activeView === 'categories' ? (
        <>
          <Button variant="outline" onClick={() => setActiveView('dashboard')}>
            ← Back to Dashboard
          </Button>
          <StoreCategorySettings storeId={store.id} />
        </>
      ) : (
        <StoreSettingsTab 
          store={store} 
          onBack={() => setActiveView('dashboard')} 
        />
      )}
    </div>
  );
};
