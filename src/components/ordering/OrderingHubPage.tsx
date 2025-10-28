import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, TruckIcon, Settings } from "lucide-react";
import { MaterialQueueView } from "./MaterialQueueView";
import { BatchOrdersView } from "./BatchOrdersView";
import { OrderTrackingView } from "./OrderTrackingView";
import { OrderScheduleSettings } from "./OrderScheduleSettings";
import { useMaterialQueueStats } from "@/hooks/useMaterialQueue";
import { useBatchOrders } from "@/hooks/useBatchOrders";

export const OrderingHubPage = () => {
  const { data: queueStats } = useMaterialQueueStats();
  const { data: batchOrders } = useBatchOrders();

  const inTransitCount = batchOrders?.filter(b => 
    ['sent', 'acknowledged', 'in_transit'].includes(b.status)
  ).length || 0;

  const pendingOrdersCount = batchOrders?.filter(b => b.status === 'draft').length || 0;

  const pendingInQueue = queueStats?.byStatus?.pending || 0;
  const inBatchCount = queueStats?.byStatus?.in_batch || 0;

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 py-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Material Purchasing</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage material orders, create supplier batches, and track deliveries
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Batch</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInQueue}</div>
            <p className="text-xs text-muted-foreground">
              Ready to add to orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Batches (Draft)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inBatchCount}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOrdersCount} {pendingOrdersCount === 1 ? 'order' : 'orders'} ready to send
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inTransitCount}</div>
            <p className="text-xs text-muted-foreground">
              Orders on the way
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="queue" className="space-y-6 sm:space-y-8">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="queue" className="flex items-center gap-2 py-2">
            <Package className="h-4 w-4" />
            <span>Queue</span>
            {pendingInQueue > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                {pendingInQueue > 99 ? '+99' : pendingInQueue}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="batches" className="flex items-center gap-2 py-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Orders</span>
            {pendingOrdersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                {pendingOrdersCount > 99 ? '+99' : pendingOrdersCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2 py-2">
            <TruckIcon className="h-4 w-4" />
            <span>Tracking</span>
            {inTransitCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                {inTransitCount > 99 ? '+99' : inTransitCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 py-2">
            <Settings className="h-4 w-4" />
            <span>Setup</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <MaterialQueueView />
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <BatchOrdersView />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <OrderTrackingView />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <OrderScheduleSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
