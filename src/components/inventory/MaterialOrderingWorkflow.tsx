import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PurchaseOrderList } from "./PurchaseOrderList";
import { CreatePurchaseOrderDialog } from "./CreatePurchaseOrderDialog";
import { SupplierManagement } from "./SupplierManagement";
import { ReorderSuggestions } from "./ReorderSuggestions";

export const MaterialOrderingWorkflow = () => {
  const [createPOOpen, setCreatePOOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Material Ordering</h2>
          <p className="text-muted-foreground">Manage purchase orders and suppliers</p>
        </div>
        <Button onClick={() => setCreatePOOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-2" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <TrendingUp className="h-4 w-4 mr-2" />
            Reorder Suggestions
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            Suppliers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <PurchaseOrderList />
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <ReorderSuggestions />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <SupplierManagement />
        </TabsContent>
      </Tabs>

      <CreatePurchaseOrderDialog open={createPOOpen} onOpenChange={setCreatePOOpen} />
    </div>
  );
};
