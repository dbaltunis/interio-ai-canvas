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
      <div className="flex items-center justify-between gap-3 p-4 rounded-lg bg-accent/50 border border-accent">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selectedItems.length === items.length && items.length > 0}
            onCheckedChange={handleSelectAll}
            className="h-5 w-5"
          />
          <span className="text-sm font-medium">
            {selectedItems.length > 0 ? (
              <span className="text-primary">{selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected</span>
            ) : (
              'Select all materials'
            )}
          </span>
        </div>
        {selectedItems.length > 0 && (
          <Badge variant="default" className="text-sm px-3 py-1">
            Ready to batch
          </Badge>
        )}
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
          <Card key={jobId} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-2">
            {/* Job Header */}
            <div className="bg-gradient-to-r from-accent/30 to-accent/10 border-b px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Checkbox
                    checked={allJobItemsSelected}
                    onCheckedChange={(checked) => handleSelectJobItems(jobItems, !!checked)}
                    className="h-4 w-4"
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="rounded-full bg-primary/10 p-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-primary whitespace-nowrap">#{getLastFourDigits(jobNumber)}</span>
                        <span className="text-sm truncate">{jobName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">{clientName}</div>
                    </div>
                  </div>
                </div>
                <Badge variant="default" className="flex-shrink-0 text-xs px-2 py-0.5">
                  {jobItems.length} item{jobItems.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            {/* Materials List */}
            <CardContent className="p-0 bg-card">
              <div className="divide-y divide-border/50">
                {jobItems.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  
                  return (
                    <div 
                      key={item.id}
                      className={`p-4 hover:bg-accent/20 transition-all duration-200 ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                          className="mt-1 h-4 w-4"
                        />
                        
                        {/* Material Image */}
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border">
                          {item.inventory_items?.image_url ? (
                            <img 
                              src={item.inventory_items.image_url} 
                              alt={item.material_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-muted-foreground/50" />
                          )}
                        </div>

                        {/* Material Details */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm text-foreground mb-0.5 truncate">{item.material_name}</h4>
                              {item.inventory_items?.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mb-0.5 break-words">
                                  {item.inventory_items.description}
                                </p>
                              )}
                              {item.inventory_items?.sku && (
                                <div className="inline-flex items-center gap-1 mt-0.5 max-w-full">
                                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">SKU:</span>
                                  <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded truncate">
                                    {item.inventory_items.sku}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Workflow Stage Indicator */}
                            <div className="flex-shrink-0">
                              {item.metadata?.source_type === 'allocate_from_stock' ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 text-[10px] px-2 py-0.5">
                                  📦 Stock
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-400 text-[10px] px-2 py-0.5">
                                  🛒 Order Required
                                </Badge>
                              )}
                            </div>
                          </div>

                          {item.metadata?.treatment_name && (
                            <div className="inline-flex items-center gap-1 text-xs bg-accent/50 px-2 py-0.5 rounded-md max-w-full">
                              <span className="text-muted-foreground whitespace-nowrap">For:</span>
                              <span className="truncate">{item.metadata.treatment_name}</span>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                            <div className="flex items-baseline gap-1 whitespace-nowrap">
                              <span className="text-muted-foreground">Quantity:</span>
                              <span className="text-foreground">{item.quantity} {item.unit}</span>
                            </div>
                            
                            {canViewCosts && (
                              <>
                                <div className="flex items-baseline gap-1 whitespace-nowrap">
                                  <span className="text-muted-foreground">Unit:</span>
                                  <span className="text-foreground">${item.unit_cost?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex items-baseline gap-1 whitespace-nowrap">
                                  <span className="text-muted-foreground">Total:</span>
                                  <span className="text-foreground">${item.total_cost?.toFixed(2) || '0.00'}</span>
                                </div>
                              </>
                            )}
                            
                            <div className="flex items-baseline gap-1 min-w-0">
                              <span className="text-muted-foreground whitespace-nowrap">Supplier:</span>
                              <span className="text-foreground truncate">{item.vendors?.name || 'Unassigned'}</span>
                            </div>
                            
                            {item.metadata?.current_stock > 0 && (
                              <div className="flex items-center gap-1 bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded whitespace-nowrap">
                                <span className="text-xs text-green-700 dark:text-green-400">
                                  ✓ {item.metadata.current_stock} in stock
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Status Badge */}
                          <div>
                            <Badge 
                              variant={statusColors[item.status as keyof typeof statusColors] || "secondary"}
                              className="text-[10px] px-2 py-0.5"
                            >
                              {statusLabels[item.status as keyof typeof statusLabels] || item.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
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
