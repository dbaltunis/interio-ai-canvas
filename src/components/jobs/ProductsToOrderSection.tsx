
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
        
        {/* Filters */}
        <div className="flex gap-4 pt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
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
            <SelectTrigger className="w-40">
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

      <CardContent>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No products need to be ordered</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByVendor).map(([vendorId, orders]) => {
              const vendor = vendors.find(v => v.id === vendorId);
              const vendorTotal = orders.reduce((sum, order) => 
                sum + (Number(order.quantity) * Number(order.unit_price)), 0
              );

              return (
                <div key={vendorId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {vendor ? vendor.name : "Unassigned Vendor"}
                      </h4>
                      {vendor && (
                        <p className="text-sm text-gray-500">
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
                          className="bg-brand-primary hover:bg-brand-accent"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Order
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className={`border rounded-lg p-3 ${isDelayed(order) ? 'border-red-300 bg-red-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{order.product_name}</h5>
                              <p className="text-sm text-gray-500">
                                {order.quantity} units @ ${Number(order.unit_price).toFixed(2)} each
                              </p>
                              {order.notes && (
                                <p className="text-sm text-blue-600 mt-1">{order.notes}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                ${(Number(order.quantity) * Number(order.unit_price)).toFixed(2)}
                              </p>
                              {order.planned_order_date && (
                                <p className="text-sm text-gray-500">
                                  Plan: {new Date(order.planned_order_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <Badge className={getProductTypeColor(order.product_type)}>
                                {order.product_type.toUpperCase()}
                              </Badge>
                              <Badge className={getStatusColor(order.order_status)}>
                                {order.order_status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {isDelayed(order) && (
                                <Badge className="bg-red-100 text-red-800">
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
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
                <div className="text-right">
                  <span className="text-lg font-medium text-gray-900">Total Estimated Cost:</span>
                  <span className="text-xl font-bold text-green-600 ml-2">
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
