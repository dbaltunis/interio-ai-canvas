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

  // Group items by project for display
  const itemsByProject = queueItems?.reduce((acc, item) => {
    const projectId = item.project_id || 'unassigned';
    if (!acc[projectId]) {
      acc[projectId] = [];
    }
    acc[projectId].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      {queueItems && queueItems.length > 0 && (
        <Alert className="mb-4 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <span className="font-medium">{queueItems.length} material{queueItems.length !== 1 ? 's' : ''}</span> waiting to be ordered
            {itemsByProject && Object.keys(itemsByProject).length > 1 && (
              <span> from {Object.keys(itemsByProject).length} project{Object.keys(itemsByProject).length !== 1 ? 's' : ''}</span>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Material Queue</CardTitle>
              <CardDescription>
                Materials waiting to be ordered from suppliers
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
