import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBatchOrders } from "@/hooks/useBatchOrders";
import { BatchOrdersList } from "./BatchOrdersList";
import { CreateBatchDialog } from "./CreateBatchDialog";

export const BatchOrdersView = () => {
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const { data: batchOrders, isLoading } = useBatchOrders();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Batch Orders</CardTitle>
              <CardDescription>
                Consolidated orders organized by supplier
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateBatch(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Batch Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BatchOrdersList
            orders={batchOrders || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <CreateBatchDialog
        open={showCreateBatch}
        onOpenChange={setShowCreateBatch}
        onSuccess={() => setShowCreateBatch(false)}
      />
    </>
  );
};
