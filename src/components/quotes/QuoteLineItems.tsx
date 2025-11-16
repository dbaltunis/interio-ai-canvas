
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Calculator } from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  category: string;
}

interface QuoteLineItemsProps {
  initialItems?: LineItem[];
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  onTaxRateChange: (rate: number) => void;
}

export const QuoteLineItems = ({
  initialItems,
  items,
  onItemsChange,
  subtotal,
  taxRate,
  taxAmount,
  total,
  onTaxRateChange
}: QuoteLineItemsProps) => {
  const [lineItems, setLineItems] = useState<LineItem[]>(initialItems || []);
  const { formatCurrency } = useFormattedCurrency();
  const [newItem, setNewItem] = useState<Omit<LineItem, 'id' | 'total'>>({
    description: "",
    quantity: 1,
    unit_price: 0,
    category: "materials"
  });

  const addItem = () => {
    if (!newItem.description.trim()) return;
    
    const item: LineItem = {
      ...newItem,
      id: Date.now().toString(),
      total: newItem.quantity * newItem.unit_price
    };
    
    onItemsChange([...items, item]);
    setNewItem({
      description: "",
      quantity: 1,
      unit_price: 0,
      category: "materials"
    });
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.total = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Quote Line Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Item Form */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="col-span-4">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Item description"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={newItem.category} 
                onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="materials">Materials</SelectItem>
                  <SelectItem value="labor">Labor</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={newItem.unit_price}
                onChange={(e) => setNewItem(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="col-span-2 flex items-end">
              <Button onClick={addItem} className="w-full bg-brand-primary hover:bg-brand-accent text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-24">Quantity</TableHead>
                    <TableHead className="w-32">Unit Price</TableHead>
                    <TableHead className="w-32">Total</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="border-0 p-1"
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={item.category} 
                          onValueChange={(value) => updateItem(item.id, 'category', value)}
                        >
                          <SelectTrigger className="border-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="materials">Materials</SelectItem>
                            <SelectItem value="labor">Labor</SelectItem>
                            <SelectItem value="hardware">Hardware</SelectItem>
                            <SelectItem value="installation">Installation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="border-0 p-1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="border-0 p-1"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(item.total)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Quote Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Tax Rate:</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxRate * 100}
                    onChange={(e) => onTaxRateChange(parseFloat(e.target.value) / 100 || 0)}
                    className="w-20 h-8"
                  />
                  <span className="text-gray-600">%</span>
                </div>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              
              <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                <span>Total:</span>
                <span className="text-brand-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
