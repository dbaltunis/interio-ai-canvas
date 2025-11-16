import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Eye,
  Edit,
  MapPin,
  History,
  Plus,
  Minus,
  Package,
  DollarSign,
  Tag,
} from 'lucide-react';
import { useEnhancedInventory, useUpdateEnhancedInventoryItem } from '@/hooks/useEnhancedInventory';
import { useCreateInventoryTransaction } from '@/hooks/useInventoryTransactions';
import { toast } from 'sonner';

interface QRCodeQuickActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  onViewDetails: (item: any) => void;
  onEdit: (item: any) => void;
}

export const QRCodeQuickActions = ({
  open,
  onOpenChange,
  itemId,
  onViewDetails,
  onEdit,
}: QRCodeQuickActionsProps) => {
  const [quantityAdjust, setQuantityAdjust] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const { data: inventory = [] } = useEnhancedInventory();
  const updateMutation = useUpdateEnhancedInventoryItem();
  const createTransactionMutation = useCreateInventoryTransaction();

  const item = inventory.find((i) => i.id === itemId);

  if (!item) {
    return null;
  }

  const handleQuickAdjust = async (type: 'add' | 'subtract') => {
    const amount = parseFloat(quantityAdjust);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const newQuantity = type === 'add' 
      ? (item.quantity || 0) + amount 
      : (item.quantity || 0) - amount;

    if (newQuantity < 0) {
      toast.error('Quantity cannot be negative');
      return;
    }

    try {
      // Update inventory
      await updateMutation.mutateAsync({
        id: itemId,
        quantity: newQuantity,
      });

      // Create transaction record
      await createTransactionMutation.mutateAsync({
        inventory_item_id: itemId,
        transaction_type: type === 'add' ? 'purchase' : 'sale',
        quantity: amount,
        notes: `Quick ${type === 'add' ? 'addition' : 'removal'} via QR scan`,
      });

      toast.success(`Quantity ${type === 'add' ? 'added' : 'removed'} successfully`);
      setQuantityAdjust('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Actions</DialogTitle>
          <DialogDescription>
            Quickly adjust quantity or manage this inventory item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Info */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{item.name}</h3>
              {item.sku && (
                <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Package className="h-3 w-3 mr-1" />
                {item.quantity || 0} {item.unit || 'units'}
              </Badge>
              {item.category && (
                <Badge variant="outline">
                  <Tag className="h-3 w-3 mr-1" />
                  {item.category}
                </Badge>
              )}
              {item.location && (
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {item.location}
                </Badge>
              )}
              {item.cost_price && (
                <Badge variant="outline">
                  <DollarSign className="h-3 w-3 mr-1" />
                  ${item.cost_price}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Quick Quantity Adjust */}
          <div className="space-y-3">
            <Label>Quick Quantity Adjustment</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter amount"
                value={quantityAdjust}
                onChange={(e) => setQuantityAdjust(e.target.value)}
                min="0"
                step="0.01"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuickAdjust('add')}
                disabled={!quantityAdjust}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuickAdjust('subtract')}
                disabled={!quantityAdjust}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Current: {item.quantity || 0} {item.unit || 'units'}
            </p>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onViewDetails(item);
                onOpenChange(false);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onEdit(item);
                onOpenChange(false);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
