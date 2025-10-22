import React, { useState } from 'react';
import { useManualQuoteItems } from '@/hooks/useManualQuoteItems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface ManualQuoteItemsTableProps {
  quoteId: string;
}

const CATEGORIES = [
  'general',
  'furniture',
  'decor',
  'lighting',
  'textiles',
  'services',
  'labor',
  'materials',
  'other',
];

const UNITS = ['unit', 'hour', 'sqm', 'meter', 'piece', 'set', 'roll', 'panel'];

export const ManualQuoteItemsTable: React.FC<ManualQuoteItemsTableProps> = ({ quoteId }) => {
  const { items, addItem, updateItem, deleteItem, totalAmount, totalTax, grandTotal } = useManualQuoteItems(quoteId);
  const [newItem, setNewItem] = useState({
    item_name: '',
    description: '',
    category: 'general',
    quantity: 1,
    unit: 'unit',
    unit_price: 0,
    tax_rate: 0,
  });

  const handleAddItem = () => {
    if (!newItem.item_name || newItem.unit_price <= 0) {
      return;
    }

    addItem({
      quote_id: quoteId,
      ...newItem,
      total_price: newItem.quantity * newItem.unit_price,
      sort_order: items.length,
    });

    // Reset form
    setNewItem({
      item_name: '',
      description: '',
      category: 'general',
      quantity: 1,
      unit: 'unit',
      unit_price: 0,
      tax_rate: 0,
    });
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    updateItem({
      id,
      updates: { [field]: value },
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Quote Items</h3>
          <p className="text-sm text-muted-foreground">
            Add products and services to this quote
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="min-w-[200px]">Item Name</TableHead>
                <TableHead className="min-w-[150px]">Description</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="w-[100px]">Qty</TableHead>
                <TableHead className="w-[100px]">Unit</TableHead>
                <TableHead className="w-[120px]">Unit Price</TableHead>
                <TableHead className="w-[100px]">Tax %</TableHead>
                <TableHead className="w-[120px]">Total</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.item_name}
                      onChange={(e) => handleUpdateItem(item.id, 'item_name', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.description || ''}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      className="h-8"
                      placeholder="Optional"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.category}
                      onValueChange={(value) => handleUpdateItem(item.id, 'category', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="h-8"
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.unit}
                      onValueChange={(value) => handleUpdateItem(item.id, 'unit', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleUpdateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="h-8"
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.tax_rate}
                      onChange={(e) => handleUpdateItem(item.id, 'tax_rate', parseFloat(e.target.value) || 0)}
                      className="h-8"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    ${item.total_price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteItem(item.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* New Item Row */}
              <TableRow className="bg-muted/30">
                <TableCell>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <Input
                    value={newItem.item_name}
                    onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                    placeholder="Item name"
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Description"
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                    className="h-8"
                    min="0"
                    step="0.01"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={newItem.unit}
                    onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
                    className="h-8"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newItem.tax_rate}
                    onChange={(e) => setNewItem({ ...newItem, tax_rate: parseFloat(e.target.value) || 0 })}
                    className="h-8"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  ${(newItem.quantity * newItem.unit_price).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={handleAddItem}
                    size="sm"
                    className="h-8"
                    disabled={!newItem.item_name || newItem.unit_price <= 0}
                  >
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax:</span>
              <span className="font-medium">${totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
