import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Send, Truck, MoreHorizontal, PackageCheck, Trash2, Package, Lock } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { SendBatchDialog } from "./SendBatchDialog";
import { ReceiveBatchDialog } from "./ReceiveBatchDialog";
import { BatchOrderDetails } from "./BatchOrderDetails";
import { EditBatchDialog } from "./EditBatchDialog";
import { useDeleteBatchOrder, useBatchOrderItems } from "@/hooks/useBatchOrders";

interface BatchOrdersListProps {
  orders: any[];
  isLoading: boolean;
}

const statusColors = {
  draft: "secondary",
  ready: "default",
  sent: "default",
  acknowledged: "default",
  in_transit: "default",
  delivered: "default",
  completed: "default",
  cancelled: "destructive",
} as const;

const statusLabels = {
  draft: "Draft",
  ready: "Ready",
  sent: "Sent",
  acknowledged: "Acknowledged",
  in_transit: "In Transit",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Component to display expanded batch details
const BatchOrderCard = ({ order, onView, onEdit, onSend, onReceive, onDelete }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { data: items } = useBatchOrderItems(order.id);
  const { data: userRole } = useUserRole();
  const canViewCosts = userRole?.canViewVendorCosts ?? false;
  const canManageOrders = userRole?.isAdmin || userRole?.isOwner || false;

  // Initialize all items as selected when expanded
  const handleExpand = () => {
    if (!isExpanded && items) {
      setSelectedItems(items.map((item: any) => item.id));
    }
    setIsExpanded(!isExpanded);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && items) {
      setSelectedItems(items.map((item: any) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  // Get unique jobs and clients from items
  const jobsAndClients = useMemo(() => {
    if (!items) return { jobs: [], clients: [] };
    
    const uniqueJobs = new Map();
    const uniqueClients = new Map();
    
    items.forEach((item: any) => {
      const project = item.material_order_queue?.projects;
      const client = item.material_order_queue?.clients;
      
      if (project) {
        uniqueJobs.set(project.id, {
          id: project.id,
          job_number: project.job_number,
          name: project.name,
        });
      }
      
      if (client) {
        uniqueClients.set(client.id, {
          id: client.id,
          name: client.name,
        });
      }
    });
    
    return {
      jobs: Array.from(uniqueJobs.values()),
      clients: Array.from(uniqueClients.values()),
    };
  }, [items]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{order.batch_number}</CardTitle>
              <Badge variant={statusColors[order.status as keyof typeof statusColors] || "secondary"} className="text-xs">
                {statusLabels[order.status as keyof typeof statusLabels] || order.status}
              </Badge>
            </div>
            <CardDescription className="mt-1 text-xs">
              {order.supplier_id ? (order.vendors?.name || 'Unknown Supplier') : (
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Stock / No Supplier
                </span>
              )}
            </CardDescription>
            
            {/* Jobs and Clients */}
            {(jobsAndClients.jobs.length > 0 || jobsAndClients.clients.length > 0) && (
              <div className="mt-2 space-y-1">
                {jobsAndClients.jobs.length > 0 && (
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-muted-foreground min-w-[50px]">Jobs:</span>
                    <div className="flex flex-wrap gap-1">
                      {jobsAndClients.jobs.map((job: any) => (
                        <Badge key={job.id} variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                          {job.job_number}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {jobsAndClients.clients.length > 0 && (
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-muted-foreground min-w-[50px]">Clients:</span>
                    <div className="text-xs">
                      {jobsAndClients.clients.map((c: any) => c.name).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(order)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {canManageOrders && order.status === 'draft' && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(order)}>
                    <Package className="h-4 w-4 mr-2" />
                    Edit / Add Materials
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSend(order)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send to Supplier
                  </DropdownMenuItem>
                </>
              )}
              {canManageOrders && ['sent', 'acknowledged', 'in_transit'].includes(order.status) && (
                <DropdownMenuItem onClick={() => onReceive(order)}>
                  <PackageCheck className="h-4 w-4 mr-2" />
                  Receive Order
                </DropdownMenuItem>
              )}
              {canManageOrders && order.status === 'draft' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(order.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Draft
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-0.5">
              <span className="text-muted-foreground block">Items</span>
              <span className="block">{order.total_items}</span>
            </div>
            <div className="space-y-0.5">
              {canViewCosts ? (
                <>
                  <span className="text-muted-foreground block">Total Amount</span>
                  <span className="block">${order.total_amount?.toFixed(2) || '0.00'}</span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground block flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" />
                    Total Amount
                  </span>
                  <span className="text-muted-foreground block">Hidden</span>
                </>
              )}
            </div>
          </div>
          
          {/* Dates */}
          <div className="space-y-1 text-xs border-t pt-2">
            {order.order_schedule_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Schedule Date:</span>
                <span>
                  {format(new Date(order.order_schedule_date), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
            {order.sent_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sent:</span>
                <span>
                  {format(new Date(order.sent_date), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
            {order.expected_delivery_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Delivery:</span>
                <span>
                  {format(new Date(order.expected_delivery_date), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
          </div>
          
          {/* Expandable Materials Section */}
          {items && items.length > 0 && (
            <div className="border-t pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpand}
                className="w-full justify-between text-xs h-8"
              >
                <span className="flex items-center gap-1.5">
                  <Package className="h-3 w-3" />
                  Materials ({items.length})
                  {order.status === 'draft' && selectedItems.length > 0 && selectedItems.length < items.length && (
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                      {selectedItems.length} selected
                    </Badge>
                  )}
                </span>
                <span className="text-[10px]">{isExpanded ? '▼' : '▶'}</span>
              </Button>
              
              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {order.status === 'draft' && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-accent/30 rounded text-xs">
                      <Checkbox
                        checked={selectedItems.length === items.length}
                        onCheckedChange={handleSelectAll}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-muted-foreground">
                        {selectedItems.length === items.length ? 'Deselect all' : 'Select all items'}
                      </span>
                    </div>
                  )}
                  
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {items.map((item: any) => {
                      const project = item.material_order_queue?.projects;
                      const client = item.material_order_queue?.clients;
                      const isSelected = selectedItems.includes(item.id);
                      
                      return (
                        <div 
                          key={item.id} 
                          className={`text-xs border rounded p-2 space-y-0.5 transition-colors ${
                            order.status === 'draft' && !isSelected ? 'opacity-50 bg-muted/30' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {order.status === 'draft' && (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                                className="h-3.5 w-3.5 mt-0.5"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <div className="truncate">{item.material_name}</div>
                                <div className="text-right whitespace-nowrap flex-shrink-0">
                                  {canViewCosts ? (
                                    <>
                                      <div>${item.total_price?.toFixed(2)}</div>
                                      <div className="text-[10px] text-muted-foreground">
                                        {item.quantity} {item.unit}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-[10px] text-muted-foreground">
                                      {item.quantity} {item.unit}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {(project || client) && (
                                <div className="text-[10px] text-muted-foreground space-y-0.5 mt-1">
                                  {project && (
                                    <div className="truncate">Job: {project.job_number} - {project.name}</div>
                                  )}
                                  {client && (
                                    <div className="truncate">Client: {client.name}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {order.status === 'draft' && selectedItems.length !== items.length && (
                    <div className="text-[10px] text-muted-foreground px-2 py-1 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                      ⚠️ Only {selectedItems.length} of {items.length} items will be sent
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(order)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            {canManageOrders && order.status === 'draft' && (
              <>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(order)}>
                  <Package className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" className="flex-1" onClick={() => onSend(order)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </>
            )}
            {canManageOrders && ['sent', 'acknowledged', 'in_transit'].includes(order.status) && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onReceive(order)}>
                <Truck className="h-4 w-4 mr-2" />
                Track
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const BatchOrdersList = ({ orders, isLoading }: BatchOrdersListProps) => {
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [editOrder, setEditOrder] = useState<any>(null);
  const [sendOrder, setSendOrder] = useState<any>(null);
  const [receiveOrder, setReceiveOrder] = useState<any>(null);
  
  const deleteBatch = useDeleteBatchOrder();

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading batch orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No batch orders yet</p>
        <p className="text-sm mt-2">Create batch orders from materials in your queue</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {orders.map((order) => (
          <BatchOrderCard
            key={order.id}
            order={order}
            onView={setViewOrder}
            onEdit={setEditOrder}
            onSend={setSendOrder}
            onReceive={setReceiveOrder}
            onDelete={(id: string) => deleteBatch.mutate(id)}
          />
        ))}
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Batch Order Details</DialogTitle>
            <DialogDescription>
              Complete information for batch order
            </DialogDescription>
          </DialogHeader>
          {viewOrder && <BatchOrderDetails batchOrder={viewOrder} />}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editOrder && (
        <EditBatchDialog
          open={!!editOrder}
          onOpenChange={(open) => !open && setEditOrder(null)}
          batchOrder={editOrder}
          onSuccess={() => setEditOrder(null)}
        />
      )}

      {/* Send Dialog */}
      {sendOrder && (
        <SendBatchDialog
          open={!!sendOrder}
          onOpenChange={(open) => !open && setSendOrder(null)}
          batchOrder={sendOrder}
          onSuccess={() => setSendOrder(null)}
        />
      )}

      {/* Receive Dialog */}
      {receiveOrder && (
        <ReceiveBatchDialog
          open={!!receiveOrder}
          onOpenChange={(open) => !open && setReceiveOrder(null)}
          batchOrder={receiveOrder}
          onSuccess={() => setReceiveOrder(null)}
        />
      )}
    </>
  );
};
