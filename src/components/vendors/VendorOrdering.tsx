
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVendors } from "@/hooks/useVendors";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { Store, Package, Mail, Calendar, Plus, Send } from "lucide-react";

export const VendorOrdering = () => {
  const { data: vendors = [] } = useVendors();
  const { data: inventory = [] } = useEnhancedInventory();
  const [orderItems, setOrderItems] = useState<Record<string, number>>({});
  const [orderFrequency, setOrderFrequency] = useState("weekly");

  // Group inventory by vendor
  const inventoryByVendor = inventory.reduce((acc, item) => {
    const vendorId = item.vendor_id || item.supplier || 'no-vendor';
    if (!acc[vendorId]) acc[vendorId] = [];
    acc[vendorId].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const generateOrderEmail = (vendorKey: string) => {
    const vendor = vendors.find(v => v.id === vendorKey) || 
                  vendors.find(v => v.name === vendorKey);
    const items = inventoryByVendor[vendorKey] || [];
    const itemsToOrder = items.filter(item => orderItems[item.id] > 0);
    
    if (itemsToOrder.length === 0) return "";

    const vendorName = vendor?.name || vendorKey;
    const orderDate = new Date().toLocaleDateString();
    const orderList = itemsToOrder.map(item => 
      `- ${item.name} ${item.sku ? `(${item.sku})` : ''}: ${orderItems[item.id]} ${item.unit || 'units'}`
    ).join('\n');

    return `Subject: ${orderFrequency.charAt(0).toUpperCase() + orderFrequency.slice(1)} Order - ${orderDate}

Dear ${vendor?.contact_person || vendorName},

Please prepare the following items for our ${orderFrequency} order:

${orderList}

Please confirm availability and expected delivery date.

Best regards,
[Your Name]`;
  };

  const sendBulkOrders = () => {
    Object.keys(inventoryByVendor).forEach(vendorKey => {
      const items = inventoryByVendor[vendorKey];
      const itemsToOrder = items.filter(item => orderItems[item.id] > 0);
      
      if (itemsToOrder.length > 0) {
        const vendor = vendors.find(v => v.id === vendorKey) || 
                     vendors.find(v => v.name === vendorKey);
        const email = generateOrderEmail(vendorKey);
        const subject = `${orderFrequency.charAt(0).toUpperCase() + orderFrequency.slice(1)} Order - ${new Date().toLocaleDateString()}`;
        const body = email.split('\n').slice(1).join('\n');
        const vendorEmail = vendor?.email || '';
        
        if (vendorEmail) {
          window.open(`mailto:${vendorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Vendor Ordering</h3>
          <p className="text-muted-foreground">
            Manage orders and send them to your vendors
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="frequency">Order Frequency:</Label>
            <Select value={orderFrequency} onValueChange={setOrderFrequency}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={sendBulkOrders} disabled={Object.keys(orderItems).filter(id => orderItems[id] > 0).length === 0}>
            <Send className="h-4 w-4 mr-2" />
            Send All Orders
          </Button>
        </div>
      </div>

      <Tabs defaultValue="by-vendor" className="w-full">
        <TabsList>
          <TabsTrigger value="by-vendor">By Vendor</TabsTrigger>
          <TabsTrigger value="pending">Pending Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="by-vendor" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(inventoryByVendor).map(([vendorKey, vendorItems]) => {
              const vendor = vendors.find(v => v.id === vendorKey) || 
                           vendors.find(v => v.name === vendorKey);
              const vendorName = vendor?.name || vendorKey === 'no-vendor' ? 'No Vendor' : vendorKey;
              const itemsToOrder = vendorItems.filter(item => orderItems[item.id] > 0);
              
              return (
                <Card key={vendorKey}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        <div>
                          <CardTitle>{vendorName}</CardTitle>
                          <CardDescription>
                            {vendorItems.length} products • {itemsToOrder.length} to order
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
                              <DialogTitle>Order Email - {vendorName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Email Template</Label>
                                <Textarea
                                  value={generateOrderEmail(vendorKey)}
                                  readOnly
                                  rows={12}
                                  className="font-mono text-sm"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => {
                                  navigator.clipboard.writeText(generateOrderEmail(vendorKey));
                                }}>
                                  Copy to Clipboard
                                </Button>
                                <Button onClick={() => {
                                  const subject = `${orderFrequency.charAt(0).toUpperCase() + orderFrequency.slice(1)} Order - ${new Date().toLocaleDateString()}`;
                                  const body = generateOrderEmail(vendorKey).split('\n').slice(1).join('\n');
                                  const email = vendor?.email || '';
                                  window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
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
                            <TableHead>Category</TableHead>
                            <TableHead className="w-32">Quantity to Order</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vendorItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="font-medium">{item.name}</div>
                                {item.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {item.description}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>{item.sku || '-'}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.category}</Badge>
                              </TableCell>
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
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(orderItems)
                      .filter(id => orderItems[id] > 0)
                      .map(itemId => {
                        const item = inventory.find(i => i.id === itemId);
                        if (!item) return null;
                        
                        const vendorKey = item.vendor_id || item.supplier || 'no-vendor';
                        const vendor = vendors.find(v => v.id === vendorKey) || 
                                     vendors.find(v => v.name === vendorKey);
                        
                        return (
                          <TableRow key={itemId}>
                            <TableCell>
                              <div className="font-medium">{item.name}</div>
                            </TableCell>
                            <TableCell>{vendor?.name || 'No vendor'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
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
