
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Package, Send, FolderOpen, ShoppingCart, Truck } from "lucide-react";
import { useState } from "react";

interface FabricOrder {
  id: string;
  fabricCode: string;
  fabricType: string;
  color: string;
  pattern: string;
  supplier: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  workOrderIds: string[];
  status: 'needed' | 'ordered' | 'received';
  orderDate?: string;
  expectedDelivery?: string;
}

interface SupplierOrderManagerProps {
  fabricOrders: FabricOrder[];
  onUpdateOrder: (id: string, updates: Partial<FabricOrder>) => void;
  onBulkOrder: (supplierName: string, orders: FabricOrder[]) => void;
}

export const SupplierOrderManager = ({ 
  fabricOrders, 
  onUpdateOrder, 
  onBulkOrder 
}: SupplierOrderManagerProps) => {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");

  // Group orders by supplier
  const supplierGroups = fabricOrders.reduce((acc, order) => {
    const supplier = order.supplier;
    if (!acc[supplier]) acc[supplier] = [];
    acc[supplier].push(order);
    return acc;
  }, {} as Record<string, FabricOrder[]>);

  const suppliers = Object.keys(supplierGroups);

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllForSupplier = (supplier: string) => {
    const supplierOrderIds = supplierGroups[supplier].map(o => o.id);
    const newSelected = new Set([...selectedOrders, ...supplierOrderIds]);
    setSelectedOrders(newSelected);
  };

  const getSelectedOrdersForSupplier = (supplier: string) => {
    return supplierGroups[supplier].filter(order => selectedOrders.has(order.id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'needed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalValue = (orders: FabricOrder[]) => {
    return orders.reduce((sum, order) => sum + order.totalPrice, 0);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="mx-auto h-8 w-8 mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{fabricOrders.filter(o => o.status === 'needed').length}</p>
            <p className="text-sm text-muted-foreground">Items Needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingCart className="mx-auto h-8 w-8 mb-2 text-yellow-600" />
            <p className="text-2xl font-bold">{fabricOrders.filter(o => o.status === 'ordered').length}</p>
            <p className="text-sm text-muted-foreground">Orders Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Truck className="mx-auto h-8 w-8 mb-2 text-green-600" />
            <p className="text-2xl font-bold">{fabricOrders.filter(o => o.status === 'received').length}</p>
            <p className="text-sm text-muted-foreground">Received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FolderOpen className="mx-auto h-8 w-8 mb-2 text-primary" />
            <p className="text-2xl font-bold">{suppliers.length}</p>
            <p className="text-sm text-muted-foreground">Suppliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Folders */}
      <div className="space-y-4">
        {suppliers.map((supplier) => {
          const supplierOrders = supplierGroups[supplier];
          const selectedCount = getSelectedOrdersForSupplier(supplier).length;
          const totalValue = getTotalValue(getSelectedOrdersForSupplier(supplier));

          return (
            <Card key={supplier} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{supplier}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{supplierOrders.length} items</span>
                        <span>Total: ${getTotalValue(supplierOrders).toFixed(2)}</span>
                        {selectedCount > 0 && (
                          <Badge variant="secondary">
                            {selectedCount} selected (${totalValue.toFixed(2)})
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => selectAllForSupplier(supplier)}
                    >
                      Select All
                    </Button>
                    {selectedCount > 0 && (
                      <Button 
                        size="sm"
                        onClick={() => onBulkOrder(supplier, getSelectedOrdersForSupplier(supplier))}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Order Selected ({selectedCount})
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={supplierOrders.every(o => selectedOrders.has(o.id))}
                          onCheckedChange={() => selectAllForSupplier(supplier)}
                        />
                      </TableHead>
                      <TableHead>Fabric</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Work Orders</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedOrders.has(order.id)}
                            onCheckedChange={() => toggleOrderSelection(order.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.fabricCode}</p>
                            <p className="text-sm text-gray-500">{order.fabricType}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{order.color}</p>
                            {order.pattern && <p className="text-gray-500">{order.pattern}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="number" 
                              value={order.quantity}
                              onChange={(e) => onUpdateOrder(order.id, { 
                                quantity: parseFloat(e.target.value) || 0,
                                totalPrice: (parseFloat(e.target.value) || 0) * order.unitPrice
                              })}
                              className="w-20"
                            />
                            <span className="text-sm text-gray-500">{order.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>${order.unitPrice.toFixed(2)}/{order.unit}</p>
                            <p className="font-medium">${order.totalPrice.toFixed(2)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          {order.orderDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Ordered: {new Date(order.orderDate).toLocaleDateString()}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            {order.workOrderIds.map((woId, idx) => (
                              <Badge key={woId} variant="outline" className="mr-1 mb-1">
                                WO-{woId.slice(-4)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
