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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: queueItems, isLoading } = useMaterialQueue({ 
    status: statusFilter === 'all' ? undefined : statusFilter 
  });

  const handleCreateBatch = () => {
    setShowCreateBatch(true);
  };

  // Calculate status counts
  const statusCounts = queueItems?.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const statusOptions = [
    { value: 'all', label: 'All', count: queueItems?.length || 0 },
    { value: 'pending', label: 'Pending', count: statusCounts['pending'] || 0 },
    { value: 'in_batch', label: 'In Batch', count: statusCounts['in_batch'] || 0 },
    { value: 'ordered', label: 'Ordered', count: statusCounts['ordered'] || 0 },
    { value: 'received', label: 'Received', count: statusCounts['received'] || 0 },
  ];

  return (
    <>
      {queueItems && queueItems.length > 0 && statusFilter === 'all' && (
        <Alert className="mb-4 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <div className="font-medium mb-1">{queueItems.length} material{queueItems.length !== 1 ? 's' : ''} in queue</div>
            <div className="text-sm space-x-4">
              {statusCounts['pending'] > 0 && <span>• {statusCounts['pending']} pending</span>}
              {statusCounts['in_batch'] > 0 && <span>• {statusCounts['in_batch']} in batch</span>}
              {statusCounts['ordered'] > 0 && <span>• {statusCounts['ordered']} ordered</span>}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Material Queue</CardTitle>
                <CardDescription className="hidden sm:block">
                  Manage materials requiring supplier orders or stock allocation
                </CardDescription>
              </div>
              <Button
                onClick={handleCreateBatch}
                disabled={selectedItems.length === 0}
                className="flex items-center gap-2"
                size="sm"
              >
                <PackagePlus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Batch Order</span>
                <span className="sm:hidden">Batch</span>
                {selectedItems.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedItems.length}
                  </Badge>
                )}
              </Button>
            </div>
            
            {/* Status Filter Chips - Responsive */}
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={statusFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(option.value);
                    setSelectedItems([]);
                  }}
                  className="flex items-center gap-1.5 text-xs"
                >
                  {option.label}
                  {option.count > 0 && (
                    <Badge 
                      variant={statusFilter === option.value ? "secondary" : "outline"}
                      className="ml-1 h-5 min-w-5 px-1.5"
                    >
                      {option.count}
                    </Badge>
                  )}
                </Button>
              ))}
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
