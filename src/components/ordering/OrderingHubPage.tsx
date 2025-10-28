import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Material Purchasing</h1>
        <p className="text-muted-foreground">
          Manage material orders, create supplier batches, and track deliveries
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materials in Queue</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueStats?.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total value: ${queueStats?.totalValue.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrdersCount}</div>
            <p className="text-xs text-muted-foreground">
              Ready to send to suppliers
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
      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Material Queue</span>
            <span className="sm:hidden">Queue</span>
          </TabsTrigger>
          <TabsTrigger value="batches" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Batch Orders</span>
            <span className="sm:hidden">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <TruckIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Tracking</span>
            <span className="sm:hidden">Track</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
            <span className="sm:hidden">Setup</span>
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
