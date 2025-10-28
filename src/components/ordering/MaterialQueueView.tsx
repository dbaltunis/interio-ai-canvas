import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, PackagePlus } from "lucide-react";
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

  return (
    <>
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
