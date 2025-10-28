import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PackagePlus, Info } from "lucide-react";
import { useMaterialQueue } from "@/hooks/useMaterialQueue";
import { MaterialQueueTable } from "./MaterialQueueTable";
import { CreateBatchDialog } from "./CreateBatchDialog";

export const MaterialQueueView = () => {
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { data: queueItems, isLoading } = useMaterialQueue({ status: 'pending' });

  const handleCreateBatch = () => {
    setShowCreateBatch(true);
  };

  // Group items by action type for display
  const itemsByAction = queueItems?.reduce((acc, item) => {
    const action = item.metadata?.source_type || 'other';
    if (!acc[action]) {
      acc[action] = [];
    }
    acc[action].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const toOrder = itemsByAction?.order_from_supplier?.length || 0;
  const toAllocate = itemsByAction?.allocate_from_stock?.length || 0;

  return (
    <>
      {queueItems && queueItems.length > 0 && (
        <Alert className="mb-4 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <div className="font-medium mb-1">{queueItems.length} material{queueItems.length !== 1 ? 's' : ''} waiting for action</div>
            <div className="text-sm space-x-4">
              {toOrder > 0 && <span>• {toOrder} to order from suppliers</span>}
              {toAllocate > 0 && <span>• {toAllocate} to allocate from stock</span>}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Material Queue</CardTitle>
              <CardDescription>
                Manage materials requiring supplier orders or stock allocation
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateBatch}
                disabled={selectedItems.length === 0}
                className="flex items-center gap-2"
              >
                <PackagePlus className="h-4 w-4" />
                Create Batch Order
                {selectedItems.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedItems.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MaterialQueueTable
            items={queueItems || []}
            isLoading={isLoading}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
          />
        </CardContent>
      </Card>

      <CreateBatchDialog
        open={showCreateBatch}
        onOpenChange={setShowCreateBatch}
        selectedItemIds={selectedItems}
        onSuccess={() => {
          setShowCreateBatch(false);
          setSelectedItems([]);
        }}
      />
    </>
  );
};
