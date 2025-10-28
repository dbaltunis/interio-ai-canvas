import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Package, Briefcase } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useDeleteMaterialQueueItem } from "@/hooks/useMaterialQueue";
import { Card, CardContent } from "@/components/ui/card";

interface MaterialQueueTableProps {
  items: any[];
  isLoading: boolean;
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
}

const priorityColors = {
  urgent: "destructive",
  high: "default",
  normal: "secondary",
  low: "outline",
} as const;

const priorityLabels = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
};

const statusColors = {
  pending: "default",
  in_batch: "secondary",
  ordered: "default",
  received: "default",
  cancelled: "destructive",
} as const;

const statusLabels = {
  pending: "Pending",
  in_batch: "In Batch",
  ordered: "Ordered",
  received: "Received",
  cancelled: "Cancelled",
};

export const MaterialQueueTable = ({ items, isLoading, selectedItems, onSelectionChange }: MaterialQueueTableProps) => {
  const deleteMaterial = useDeleteMaterialQueueItem();
  const { data: userRole } = useUserRole();
  const canViewCosts = userRole?.canViewVendorCosts ?? false;

  // Group items by job/project
  const groupedItems = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    items.forEach(item => {
      const jobId = item.project_id || item.quote_id || 'unassigned';
      if (!groups[jobId]) {
        groups[jobId] = [];
      }
      groups[jobId].push(item);
    });
    
    return groups;
  }, [items]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(items.map(item => item.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, itemId]);
    } else {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectJobItems = (jobItems: any[], checked: boolean) => {
    const jobItemIds = jobItems.map(item => item.id);
    if (checked) {
      const newSelection = [...new Set([...selectedItems, ...jobItemIds])];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange(selectedItems.filter(id => !jobItemIds.includes(id)));
    }
  };

  const getLastFourDigits = (jobNumber: string) => {
    return jobNumber?.slice(-4) || '????';
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading materials...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No materials in queue</p>
        <p className="text-sm mt-2">Materials from jobs will appear here when they need to be ordered</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Select All Controls */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <Checkbox
          checked={selectedItems.length === items.length && items.length > 0}
          onCheckedChange={handleSelectAll}
        />
        <span className="text-sm text-muted-foreground">
          {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'Select all'}
        </span>
      </div>

      {/* Grouped by Job */}
      {Object.entries(groupedItems).map(([jobId, jobItems]) => {
        const firstItem = jobItems[0];
        const jobNumber = firstItem.projects?.job_number || firstItem.quotes?.quote_number || '—';
        const jobName = firstItem.projects?.name || 'Untitled Job';
        const clientName = firstItem.clients?.name || 'No Client';
        const jobItemIds = jobItems.map(item => item.id);
        const allJobItemsSelected = jobItemIds.every(id => selectedItems.includes(id));

        return (
          <Card key={jobId} className="overflow-hidden">
            {/* Job Header */}
            <div className="bg-muted/30 border-b px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Checkbox
                    checked={allJobItemsSelected}
                    onCheckedChange={(checked) => handleSelectJobItems(jobItems, !!checked)}
                  />
                  <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-medium">#{getLastFourDigits(jobNumber)}</span>
                      <span className="text-sm font-medium truncate">{jobName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{clientName}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="flex-shrink-0">
                  {jobItems.length} item{jobItems.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            {/* Materials List */}
            <CardContent className="p-0">
              <div className="divide-y">
                {jobItems.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  
                  return (
                    <div 
                      key={item.id}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                          className="mt-1"
                        />
                        
                        {/* Material Image Placeholder */}
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>

                        {/* Material Details */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <h4 className="font-medium">{item.material_name}</h4>
                            {item.metadata?.treatment_name && (
                              <p className="text-xs text-muted-foreground">
                                For: {item.metadata.treatment_name}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Qty:</span>{' '}
                              <span className="font-medium">{item.quantity} {item.unit}</span>
                            </div>
                            
                            {canViewCosts && (
                              <>
                                <div className="text-muted-foreground">•</div>
                                <div>
                                  <span className="text-muted-foreground">Unit:</span>{' '}
                                  <span className="font-medium">${item.unit_cost?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="text-muted-foreground">•</div>
                                <div>
                                  <span className="text-muted-foreground">Total:</span>{' '}
                                  <span className="font-medium">${item.total_cost?.toFixed(2) || '0.00'}</span>
                                </div>
                              </>
                            )}
                            
                            <div className="text-muted-foreground">•</div>
                            <div>
                              <span className="text-muted-foreground">Supplier:</span>{' '}
                              <span>{item.vendors?.name || 'Unassigned'}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant={statusColors[item.status as keyof typeof statusColors] || "secondary"}>
                              {statusLabels[item.status as keyof typeof statusLabels] || item.status}
                            </Badge>
                            <Badge variant={priorityColors[item.priority as keyof typeof priorityColors] || "secondary"}>
                              {priorityLabels[item.priority as keyof typeof priorityLabels] || item.priority}
                            </Badge>
                            {item.metadata?.current_stock > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {item.metadata.current_stock} in stock
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0"
                          onClick={() => deleteMaterial.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
