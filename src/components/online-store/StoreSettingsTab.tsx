import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, Palette, Globe, CreditCard, Settings, Check, AlertCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OnlineStore } from "@/types/online-store";
import { DomainSetupWizard } from "./domain-setup/DomainSetupWizard";

interface StoreSettingsTabProps {
  store: OnlineStore;
  onBack: () => void;
}

export const StoreSettingsTab = ({ store, onBack }: StoreSettingsTabProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDomainWizard, setShowDomainWizard] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [settings, setSettings] = useState({
    storeName: store.store_name,
    storeSlug: store.store_slug,
    seoTitle: store.seo_title || '',
    seoDescription: store.seo_description || '',
    primaryColor: store.primary_color,
    secondaryColor: store.secondary_color,
    accentColor: store.accent_color,
    fontFamily: store.font_family,
    customDomain: store.custom_domain || '',
    googleAnalyticsId: store.google_analytics_id || '',
    paymentProvider: store.payment_provider,
  });

  const saveSettings = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('online_stores')
        .update({
          store_name: settings.storeName,
          store_slug: settings.storeSlug,
          seo_title: settings.seoTitle,
          seo_description: settings.seoDescription,
          primary_color: settings.primaryColor,
          secondary_color: settings.secondaryColor,
          accent_color: settings.accentColor,
          font_family: settings.fontFamily,
          custom_domain: settings.customDomain,
          google_analytics_id: settings.googleAnalyticsId,
          payment_provider: settings.paymentProvider,
        })
        .eq('id', store.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-store'] });
      toast({
        title: "Settings saved",
        description: "Your store settings have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteStore = useMutation({
    mutationFn: async () => {
      console.log('[StoreSettings] Deleting store:', store.id);
      const { error } = await supabase.rpc('delete_online_store', {
        store_id_param: store.id
      });

      if (error) {
        console.error('[StoreSettings] Delete error:', error);
        throw error;
      }
      console.log('[StoreSettings] Store deleted successfully');
    },
    onSuccess: async () => {
      console.log('[StoreSettings] Invalidating queries and refreshing...');
      
      // Clear all store-related queries
      queryClient.invalidateQueries({ queryKey: ['online-store'] });
      queryClient.invalidateQueries({ queryKey: ['has-online-store'] });
      queryClient.invalidateQueries({ queryKey: ['has-online-store-nav'] });
      
      toast({
        title: "Store deleted",
        description: "Your store has been deleted successfully. Refreshing...",
      });
      
      // Navigate to home and force a page reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    },
    onError: (error: any) => {
      console.error('[StoreSettings] Delete failed:', error);
      toast({
        title: "Failed to delete store",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fontOptions = [
    'Inter, sans-serif',
    'Playfair Display, serif',
    'Lato, sans-serif',
    'Montserrat, sans-serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
  ];

  return (
    <div className="space-y-6">
      <DomainSetupWizard
        open={showDomainWizard}
        onOpenChange={setShowDomainWizard}
        storeId={store.id}
        currentDomain={store.custom_domain}
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Store Settings</h2>
            <p className="text-muted-foreground">Manage your store configuration</p>
          </div>
        </div>
        <Button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveSettings.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="design">
            <Palette className="h-4 w-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Globe className="h-4 w-4 mr-2" />
            SEO & Domain
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic details about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input
                  id="store-name"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-slug">Store URL Slug</Label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-muted rounded-md text-sm text-muted-foreground">
                    /store/
                  </span>
                  <Input
                    id="store-slug"
                    value={settings.storeSlug}
                    onChange={(e) => setSettings({ ...settings, storeSlug: e.target.value })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Your store will be available at: /store/{settings.storeSlug}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Customize your store's color scheme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Choose fonts for your store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value) => setSettings({ ...settings, fontFamily: value })}
                >
                  <SelectTrigger id="font-family">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize your store for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">SEO Title</Label>
                <Input
                  id="seo-title"
                  value={settings.seoTitle}
                  onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                  placeholder="Your store name and what you sell"
                />
                <p className="text-sm text-muted-foreground">
                  Recommended: 50-60 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-description">SEO Description</Label>
                <Textarea
                  id="seo-description"
                  value={settings.seoDescription}
                  onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                  placeholder="Brief description of your store and products"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  Recommended: 150-160 characters
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Domain</CardTitle>
                  <CardDescription>Connect your own domain name</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowDomainWizard(true)}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Setup Domain
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {store.custom_domain ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{store.custom_domain}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {store.domain_verified ? (
                            <>
                              <Check className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600">Verified</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 text-yellow-600" />
                              <span className="text-xs text-yellow-600">Verification Pending</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDomainWizard(true)}
                    >
                      Manage
                    </Button>
                  </div>
                  {!store.domain_verified && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Complete DNS setup to verify your domain. Click "Manage" to continue.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No custom domain configured. Use our setup wizard to connect your domain.
                  </p>
                  <Button
                    onClick={() => setShowDomainWizard(true)}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Connect Domain
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Track your store's performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ga-id">Google Analytics ID</Label>
                <Input
                  id="ga-id"
                  value={settings.googleAnalyticsId}
                  onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Provider</CardTitle>
              <CardDescription>Choose how you'll accept payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-provider">Provider</Label>
                <Select
                  value={settings.paymentProvider}
                  onValueChange={(value: 'stripe' | 'paypal') => 
                    setSettings({ ...settings, paymentProvider: value })
                  }
                >
                  <SelectTrigger id="payment-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Connect your {settings.paymentProvider} account in the Payments section
                  of your main settings to start accepting payments.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your online store and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. This will permanently delete your store,
              all pages, products, and inquiries.
            </AlertDescription>
          </Alert>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Store
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your store "{store.store_name}" and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteStore.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteStore.isPending}
            >
              {deleteStore.isPending ? "Deleting..." : "Delete Store"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
