
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductOrders, useDeleteProductOrder, useUpdateProductOrder } from "@/hooks/useProductOrders";
import { useVendors } from "@/hooks/useVendors";
import { ProductOrderForm } from "./ProductOrderForm";
import { ShoppingCart, Package, Plus, Mail, Download, Edit, Trash2, Filter, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductsToOrderSectionProps {
  projectId: string;
  jobNumber?: string;
  clientName?: string;
}

export const ProductsToOrderSection = ({ projectId, jobNumber, clientName }: ProductsToOrderSectionProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  const [editingOrder, setEditingOrder] = useState<any>(null);

  const { data: productOrders = [] } = useProductOrders(projectId);
  const { data: vendors = [] } = useVendors();
  const deleteProductOrder = useDeleteProductOrder();
  const updateProductOrder = useUpdateProductOrder();
  const { toast } = useToast();

  const filteredOrders = productOrders.filter(order => {
    const statusMatch = statusFilter === "all" || order.order_status === statusFilter;
    const vendorMatch = vendorFilter === "all" || order.vendor_id === vendorFilter;
    return statusMatch && vendorMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-green-100 text-green-800";
      case "ordered":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getProductTypeColor = (type: string) => {
    switch (type) {
      case "fabric":
        return "bg-primary/10 text-primary";
      case "hardware":
        return "bg-gray-100 text-gray-800";
      case "track":
        return "bg-blue-100 text-blue-800";
      case "accessory":
        return "bg-green-100 text-green-800";
      case "lining":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-secondary/20 text-secondary-foreground";
    }
  };

  const isDelayed = (order: any) => {
    if (!order.planned_order_date) return false;
    const planned = new Date(order.planned_order_date);
    const today = new Date();
    return planned < today && order.order_status === "to_order";
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product order?")) {
      try {
        await deleteProductOrder.mutateAsync(id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product order",
          variant: "destructive",
        });
      }
    }
  };

  const handleSendOrderToVendor = (vendorId: string) => {
    const vendorOrders = filteredOrders.filter(order => order.vendor_id === vendorId);
    const vendor = vendors.find(v => v.id === vendorId);
    
    if (!vendor || !vendorOrders.length) return;

    // Create email content
    const orderList = vendorOrders.map(order => 
      `${order.product_name} - ${order.quantity} units @ $${order.unit_price} each = $${(Number(order.quantity) * Number(order.unit_price)).toFixed(2)}`
    ).join('\n');

    const totalAmount = vendorOrders.reduce((sum, order) => 
      sum + (Number(order.quantity) * Number(order.unit_price)), 0
    );

    const emailBody = `Dear ${vendor.contact_person || vendor.name},

Please prepare the following order for:
Job Number: ${jobNumber}
Client: ${clientName}

ORDER DETAILS:
${orderList}

Total Order Value: $${totalAmount.toFixed(2)}

Please confirm receipt and provide delivery timeline.

Best regards`;

    const mailtoLink = `mailto:${vendor.email}?subject=Purchase Order - Job ${jobNumber}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink);
  };

  const getOrderProgress = (order: any) => {
    const steps = ['to_order', 'ordered', 'received'];
    const currentIndex = steps.indexOf(order.order_status);
    return {
      current: currentIndex + 1,
      total: steps.length,
      percentage: ((currentIndex + 1) / steps.length) * 100
    };
  };

  const groupedByVendor = filteredOrders.reduce((acc, order) => {
    const vendorId = order.vendor_id || "unassigned";
    if (!acc[vendorId]) acc[vendorId] = [];
    acc[vendorId].push(order);
    return acc;
  }, {} as Record<string, any[]>);

  const totalEstimatedCost = filteredOrders.reduce((sum, order) => 
    sum + (Number(order.quantity) * Number(order.unit_price)), 0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Products to Order from Suppliers
          </CardTitle>
          <ProductOrderForm projectId={projectId} />
        </div>
        
        {/* Mobile-Optimized Filters */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full h-11 touch-target">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="to_order">To Order</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          
            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger className="w-full h-11 touch-target">
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No products need to be ordered</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByVendor).map(([vendorId, orders]) => {
              const vendor = vendors.find(v => v.id === vendorId);
              const vendorTotal = orders.reduce((sum, order) => 
                sum + (Number(order.quantity) * Number(order.unit_price)), 0
              );

              return (
                <div key={vendorId} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {vendor ? vendor.name : "Unassigned Vendor"}
                      </h4>
                      {vendor && (
                        <p className="text-sm text-muted-foreground">
                          {vendor.email} • Lead time: {vendor.lead_time_days} days
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        ${vendorTotal.toFixed(2)}
                      </span>
                      {vendor && (
                        <Button
                          onClick={() => handleSendOrderToVendor(vendorId)}
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Send Order</span>
                          <span className="sm:hidden">Send</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                     {orders.map((order) => {
                       const progress = getOrderProgress(order);
                       return (
                       <div
                         key={order.id}
                          className={`border rounded-lg p-4 ${isDelayed(order) ? 'border-destructive bg-destructive/5' : 'hover:bg-muted/50'} transition-colors`}
                       >
                         {/* Progress Bar */}
                          <div className="w-full bg-muted rounded-full h-2 mb-3">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${progress.percentage}%` }}
                            />
                         </div>
                         
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <div className="bg-primary/10 p-2 rounded-full shrink-0">
                                <Package className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-foreground">{order.product_name}</h5>
                                <p className="text-sm text-muted-foreground">
                                  {order.quantity} units @ ${Number(order.unit_price).toFixed(2)} each
                                </p>
                                 {order.notes && (
                                   <p className="text-sm text-primary mt-1">{order.notes}</p>
                                 )}
                              </div>
                            </div>
                           
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center justify-between sm:justify-start space-x-4">
                                <div className="text-right sm:text-left">
                                  <p className="font-medium text-foreground">
                                    ${(Number(order.quantity) * Number(order.unit_price)).toFixed(2)}
                                  </p>
                                  {order.planned_order_date && (
                                    <p className="text-sm text-muted-foreground">
                                      Plan: {new Date(order.planned_order_date).toLocaleDateString()}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    Step {progress.current} of {progress.total}
                                  </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {order.product_type.toUpperCase()}
                                  </Badge>
                                  <Badge 
                                    className={`text-xs ${getStatusColor(order.order_status)}`}
                                  >
                                    {order.order_status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                  {isDelayed(order) && (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      <span className="hidden sm:inline">DELAYED</span>
                                    </Badge>
                                  )}
                                </div>
                              </div>
                             
                             <div className="flex flex-wrap gap-1 justify-end sm:justify-start">
                               {/* Status Update Buttons */}
                               {order.order_status === 'to_order' && (
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => updateProductOrder.mutateAsync({
                                     id: order.id,
                                     order_status: 'ordered'
                                   })}
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950"
                                 >
                                   <CheckCircle className="h-3 w-3 mr-1" />
                                   <span className="hidden sm:inline">Mark Ordered</span>
                                   <span className="sm:hidden">Order</span>
                                 </Button>
                               )}
                               
                               {order.order_status === 'ordered' && (
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => updateProductOrder.mutateAsync({
                                     id: order.id,
                                     order_status: 'received'
                                   })}
                                    className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950"
                                 >
                                   <CheckCircle className="h-3 w-3 mr-1" />
                                   <span className="hidden sm:inline">Mark Received</span>
                                   <span className="sm:hidden">Received</span>
                                 </Button>
                                )}

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingOrder(order)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(order.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                             </div>
                            </div>
                           </div>
                         </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
                <div className="text-right">
                  <span className="text-lg font-medium text-foreground">Total Estimated Cost:</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400 ml-2">
                    ${totalEstimatedCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingOrder && (
          <ProductOrderForm
            projectId={projectId}
            productOrder={editingOrder}
            onClose={() => setEditingOrder(null)}
            trigger={<div />}
          />
        )}
      </CardContent>
    </Card>
  );
};
