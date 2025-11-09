import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnlineStore } from "@/types/online-store";
import { useStoreStats } from "@/hooks/useStoreStats";
import { ExternalLink, Edit, Package, MessageSquare, Globe, Settings, Eye, EyeOff, Briefcase, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

  // Check for new orders/leads (created in last 24 hours)
  const hasRecentOrders = stats?.newInquiries && stats.newInquiries > 0;

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
      {/* Alert for new orders/leads */}
      {hasRecentOrders && (
        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900 dark:text-orange-100">
            {stats.newInquiries} New {stats.newInquiries === 1 ? 'Order' : 'Orders'} in Last 7 Days
          </AlertTitle>
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            You have new online store orders waiting for your attention.{" "}
            <Link to="/?tab=jobs" className="font-semibold underline hover:no-underline">
              View all orders & leads →
            </Link>
          </AlertDescription>
        </Alert>
      )}

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
            <Button variant="outline" asChild>
              <Link to="/?tab=jobs">
                <Briefcase className="h-4 w-4 mr-2" />
                View All Orders & Leads
              </Link>
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
        <Card className={hasRecentOrders ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/50" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              New Orders/Leads
              {hasRecentOrders && <Badge variant="destructive" className="ml-2">New!</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.newInquiries || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days • View in Jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Quote Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalQuoteRequests || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All time • Managed in Jobs</p>
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/?tab=jobs">
                <Briefcase className="h-4 w-4 mr-2" />
                View All in Jobs
              </Link>
            </Button>
          </div>
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
              <p>No recent orders or inquiries</p>
              <p className="text-sm">Orders will appear as jobs when customers make purchases</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to="/?tab=jobs">View Jobs Dashboard</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
