import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useBatchOrders } from "@/hooks/useBatchOrders";
import { BatchOrdersList } from "./BatchOrdersList";
import { CreateBatchDialog } from "./CreateBatchDialog";

export const BatchOrdersView = () => {
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: batchOrders, isLoading } = useBatchOrders({
    status: statusFilter === 'all' ? undefined : statusFilter
  });

  // Calculate status counts
  const statusCounts = batchOrders?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const statusOptions = [
    { value: 'all', label: 'All', count: batchOrders?.length || 0 },
    { value: 'draft', label: 'Draft', count: statusCounts['draft'] || 0 },
    { value: 'sent', label: 'Sent', count: statusCounts['sent'] || 0 },
    { value: 'in_transit', label: 'In Transit', count: statusCounts['in_transit'] || 0 },
    { value: 'delivered', label: 'Delivered', count: statusCounts['delivered'] || 0 },
  ];

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
          
          {/* Status Filter Chips */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant={statusFilter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(option.value)}
                className="flex items-center gap-1.5"
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
