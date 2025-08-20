
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductOrders, useDeleteProductOrder } from "@/hooks/useProductOrders";
import { useVendors } from "@/hooks/useVendors";
import { ProductOrderForm } from "./ProductOrderForm";
import { ShoppingCart, Package, Plus, Mail, Download, Edit, Trash2, Filter } from "lucide-react";
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
  const { toast } = useToast();

  const filteredOrders = productOrders.filter(order => {
    const statusMatch = statusFilter === "all" || order.order_status === statusFilter;
    const vendorMatch = vendorFilter === "all" || order.vendor_id === vendorFilter;
    return statusMatch && vendorMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-success/10 text-success border-success/20";
      case "ordered":
        return "bg-info/10 text-info border-info/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-warning/10 text-warning border-warning/20";
    }
  };

  const getProductTypeColor = (type: string) => {
    switch (type) {
      case "fabric":
        return "bg-primary/10 text-primary border-primary/20";
      case "hardware":
        return "bg-muted/50 text-muted-foreground border-muted/50";
      case "track":
        return "bg-info/10 text-info border-info/20";
      case "accessory":
        return "bg-success/10 text-success border-success/20";
      case "lining":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-secondary/10 text-secondary-foreground border-secondary/20";
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
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Products to Order from Suppliers
          </CardTitle>
          <ProductOrderForm projectId={projectId} />
        </div>
        
        {/* Compact Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="to_order">To Order</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={vendorFilter} onValueChange={setVendorFilter}>
            <SelectTrigger className="w-40 h-8">
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
      </CardHeader>

      <CardContent className="pt-0">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-6">
            <Package className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No products need to be ordered</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByVendor).map(([vendorId, orders]) => {
              const vendor = vendors.find(v => v.id === vendorId);
              const vendorTotal = orders.reduce((sum, order) => 
                sum + (Number(order.quantity) * Number(order.unit_price)), 0
              );

              return (
                <div key={vendorId} className="border border-border rounded-lg p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h4 className="font-medium text-base">
                        {vendor ? vendor.name : "Unassigned Vendor"}
                      </h4>
                      {vendor && (
                        <p className="text-sm text-muted-foreground">
                          {vendor.email} • Lead time: {vendor.lead_time_days} days
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-base font-semibold">
                        ${vendorTotal.toFixed(2)}
                      </span>
                      {vendor && (
                        <Button
                          onClick={() => handleSendOrderToVendor(vendorId)}
                          size="sm"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Order
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className={`border border-border rounded-lg p-3 transition-colors ${
                          isDelayed(order) 
                            ? 'border-destructive/50 bg-destructive/5' 
                            : 'hover:bg-muted/20'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
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
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                            <div className="text-left sm:text-right">
                              <p className="font-medium text-foreground">
                                ${(Number(order.quantity) * Number(order.unit_price)).toFixed(2)}
                              </p>
                              {order.planned_order_date && (
                                <p className="text-sm text-muted-foreground">
                                  Plan: {new Date(order.planned_order_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className={getProductTypeColor(order.product_type)}>
                                {order.product_type.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className={getStatusColor(order.order_status)}>
                                {order.order_status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {isDelayed(order) && (
                                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                                  DELAYED
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex gap-1">
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
                    ))}
                  </div>
                </div>
              );
            })}
            
            <div className="border-t border-border pt-3 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-sm font-medium text-foreground">Total Estimated Cost:</span>
                  <span className="text-lg font-bold text-success ml-2">
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
