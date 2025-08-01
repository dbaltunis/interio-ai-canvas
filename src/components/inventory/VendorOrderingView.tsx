
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useVendors } from "@/hooks/useVendors";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { Store, Package, Mail, Calendar, Plus } from "lucide-react";

export const VendorOrderingView = () => {
  const { data: vendors = [] } = useVendors();
  const { data: inventory = [] } = useEnhancedInventory();
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [orderItems, setOrderItems] = useState<Record<string, number>>({});

  // Group inventory by vendor
  const inventoryByVendor = inventory.reduce((acc, item) => {
    const vendorId = item.vendor_id || 'no-vendor';
    if (!acc[vendorId]) acc[vendorId] = [];
    acc[vendorId].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const generateOrderEmail = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    const items = inventoryByVendor[vendorId] || [];
    const itemsToOrder = items.filter(item => orderItems[item.id] > 0);
    
    if (!vendor || itemsToOrder.length === 0) return "";

    const orderList = itemsToOrder.map(item => 
      `- ${item.name} (${item.sku || 'N/A'}): ${orderItems[item.id]} ${item.unit || 'units'}`
    ).join('\n');

    return `Subject: Weekly Order - ${new Date().toLocaleDateString()}

Dear ${vendor.contact_person || vendor.name},

Please prepare the following items for our weekly order:

${orderList}

Delivery Address:
[Your Address]

Please confirm availability and expected delivery date.

Best regards,
[Your Name]`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendor Ordering</h2>
          <p className="text-muted-foreground">
            Manage weekly orders and track items needed from each vendor
          </p>
        </div>
      </div>

      <Tabs defaultValue="vendors" className="w-full">
        <TabsList>
          <TabsTrigger value="vendors">By Vendor</TabsTrigger>
          <TabsTrigger value="pending">Pending Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors" className="space-y-4">
          <div className="grid gap-4">
            {vendors.map((vendor) => {
              const vendorItems = inventoryByVendor[vendor.id] || [];
              const itemsToOrder = vendorItems.filter(item => orderItems[item.id] > 0);
              
              return (
                <Card key={vendor.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        <div>
                          <CardTitle>{vendor.name}</CardTitle>
                          <CardDescription>
                            {vendorItems.length} products • {itemsToOrder.length} pending
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={itemsToOrder.length === 0}>
                              <Mail className="h-4 w-4 mr-2" />
                              Generate Email
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Order Email - {vendor.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Email Template</Label>
                                <Textarea
                                  value={generateOrderEmail(vendor.id)}
                                  readOnly
                                  rows={12}
                                  className="font-mono text-sm"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => {
                                  navigator.clipboard.writeText(generateOrderEmail(vendor.id));
                                }}>
                                  Copy to Clipboard
                                </Button>
                                <Button onClick={() => {
                                  const subject = `Weekly Order - ${new Date().toLocaleDateString()}`;
                                  const body = generateOrderEmail(vendor.id).split('\n').slice(1).join('\n');
                                  window.open(`mailto:${vendor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                                }}>
                                  Open in Email Client
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {vendorItems.length > 0 && (
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="w-32">Quantity Needed</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vendorItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {item.category}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{item.sku || '-'}</TableCell>
                              <TableCell>{item.unit || 'units'}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={orderItems[item.id] || 0}
                                  onChange={(e) => setOrderItems(prev => ({
                                    ...prev,
                                    [item.id]: parseInt(e.target.value) || 0
                                  }))}
                                  min="0"
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>
                                {orderItems[item.id] > 0 ? (
                                  <Badge variant="secondary">To Order</Badge>
                                ) : (
                                  <Badge variant="outline">Available</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Orders Summary</CardTitle>
              <CardDescription>
                All items currently marked for ordering across all vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(orderItems).filter(id => orderItems[id] > 0).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No items currently marked for ordering
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(orderItems)
                      .filter(id => orderItems[id] > 0)
                      .map(itemId => {
                        const item = inventory.find(i => i.id === itemId);
                        const vendor = vendors.find(v => v.id === item?.vendor_id);
                        if (!item) return null;
                        
                        return (
                          <TableRow key={itemId}>
                            <TableCell>
                              <div className="font-medium">{item.name}</div>
                            </TableCell>
                            <TableCell>{vendor?.name || 'No vendor'}</TableCell>
                            <TableCell>
                              {orderItems[itemId]} {item.unit || 'units'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOrderItems(prev => ({
                                  ...prev,
                                  [itemId]: 0
                                }))}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
