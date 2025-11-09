import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnlineStore } from "@/types/online-store";
import { useStoreStats } from "@/hooks/useStoreStats";
import { ExternalLink, Edit, Package, MessageSquare, Globe, Settings, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface StoreDashboardProps {
  store: OnlineStore;
  onEditPages: () => void;
  onManageProducts: () => void;
  onViewSettings: () => void;
}

export const StoreDashboard = ({ store, onEditPages, onManageProducts, onViewSettings }: StoreDashboardProps) => {
  const { data: stats } = useStoreStats(store.id);
  const queryClient = useQueryClient();

  const storeUrl = store.custom_domain && store.domain_verified
    ? `https://${store.custom_domain}`
    : `${window.location.origin}/store/${store.store_slug}`;

  const handleViewStore = () => {
    if (!store.is_published) {
      toast({
        title: "Store Not Published",
        description: "Please publish your store first to view it.",
        variant: "destructive",
      });
      return;
    }
    window.open(storeUrl, '_blank');
  };

  const togglePublish = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('online_stores')
        .update({ is_published: !store.is_published })
        .eq('id', store.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-store'] });
      toast({
        title: store.is_published ? "Store Unpublished" : "Store Published!",
        description: store.is_published
          ? "Your store is now hidden from the public"
          : "Your store is now live and accessible to customers",
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Store Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {store.store_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                {storeUrl}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={handleViewStore}
                  title={store.is_published ? "View store in new tab" : "Publish store to view"}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </CardDescription>
            </div>
            <Badge variant={store.is_published ? "default" : "secondary"}>
              {store.is_published ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => togglePublish.mutate()}
              disabled={togglePublish.isPending}
              variant={store.is_published ? "outline" : "default"}
            >
              {store.is_published ? (
                <><EyeOff className="h-4 w-4 mr-2" />Unpublish Store</>
              ) : (
                <><Eye className="h-4 w-4 mr-2" />Publish Store</>
              )}
            </Button>
            {store.is_published && (
              <Button variant="default" onClick={handleViewStore}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Store
              </Button>
            )}
            <Button variant="outline" onClick={onEditPages}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Pages
            </Button>
            <Button variant="outline" onClick={onManageProducts}>
              <Package className="h-4 w-4 mr-2" />
              Manage Products
            </Button>
            <Button variant="outline" onClick={onViewSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Store Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.newInquiries || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quote Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalQuoteRequests || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.productCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Visible products</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Inquiries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentInquiries && stats.recentInquiries.length > 0 ? (
            <div className="space-y-3">
              {stats.recentInquiries.map((inquiry: any) => (
                <div
                  key={inquiry.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{inquiry.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{inquiry.customer_email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{inquiry.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No inquiries yet</p>
              <p className="text-sm">Share your store to start receiving inquiries</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
