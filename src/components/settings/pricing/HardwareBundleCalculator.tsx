import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Plus, Calculator, Package2 } from 'lucide-react';
import { 
  calculateTrackBundle, 
  calculateRodBundle,
  BundleCalculationResult 
} from '@/utils/pricing/bundleCalculator';
import { useEnhancedInventory } from '@/hooks/useEnhancedInventory';
import { formatCurrency } from '@/utils/formatters';

interface BundlePreviewProps {
  widthFt: number;
  isDouble: boolean;
  mountType: 'ceiling' | 'wall';
  selectedHardware?: any;
}

const BundlePreview = ({ widthFt, isDouble, mountType, selectedHardware }: BundlePreviewProps) => {
  const result = useMemo(() => {
    if (!selectedHardware) return null;
    
    const subcategory = selectedHardware.subcategory || 'track';
    const metadata = selectedHardware.metadata || {};
    
    if (subcategory === 'rod') {
      return calculateRodBundle(widthFt, isDouble, metadata);
    } else {
      return calculateTrackBundle(widthFt, isDouble, mountType, metadata);
    }
  }, [widthFt, isDouble, mountType, selectedHardware]);

  if (!result || result.lineItems.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Select hardware item to see bundle breakdown
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Accessory</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.lineItems.map((item, i) => (
            <TableRow key={i}>
              <TableCell>
                <div>
                  <span className="font-medium">{item.name}</span>
                  <div className="text-xs text-muted-foreground">{item.formula}</div>
                </div>
              </TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.unitPrice, 'INR')}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(item.total, 'INR')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex justify-between items-center pt-2 border-t">
        <span className="font-medium">Bundle Subtotal</span>
        <span className="text-lg font-bold">{formatCurrency(result.subtotal, 'INR')}</span>
      </div>
    </div>
  );
};

export const HardwareBundleCalculator = () => {
  const { data: inventoryItems = [] } = useEnhancedInventory();
  const [widthFt, setWidthFt] = useState(10);
  const [isDouble, setIsDouble] = useState(false);
  const [mountType, setMountType] = useState<'ceiling' | 'wall'>('wall');
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>('');

  // Filter hardware items (tracks and rods)
  const hardwareItems = useMemo(() => {
    return inventoryItems.filter(item => 
      item.category === 'hardware' && 
      (item.subcategory === 'track' || item.subcategory === 'rod')
    );
  }, [inventoryItems]);

  const selectedHardware = hardwareItems.find(h => h.id === selectedHardwareId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Hardware Bundle Calculator
        </CardTitle>
        <CardDescription>
          Calculate accessory quantities and costs for tracks and rods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Hardware</Label>
            <Select value={selectedHardwareId} onValueChange={setSelectedHardwareId}>
              <SelectTrigger>
                <SelectValue placeholder="Select hardware" />
              </SelectTrigger>
              <SelectContent>
                {hardwareItems.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Width (ft)</Label>
            <Input 
              type="number" 
              value={widthFt} 
              onChange={(e) => setWidthFt(Number(e.target.value))}
              min={1}
              max={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Mount Type</Label>
            <Select value={mountType} onValueChange={(v) => setMountType(v as 'ceiling' | 'wall')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ceiling">Ceiling</SelectItem>
                <SelectItem value="wall">Wall</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Checkbox 
                checked={isDouble}
                onCheckedChange={(checked) => setIsDouble(!!checked)}
              />
              Double Track/Rod
            </Label>
          </div>
        </div>

        {/* Bundle Preview */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Package2 className="h-4 w-4" />
            Bundle Breakdown
          </h4>
          <BundlePreview 
            widthFt={widthFt}
            isDouble={isDouble}
            mountType={mountType}
            selectedHardware={selectedHardware}
          />
        </div>

        {/* Hardware Price */}
        {selectedHardware && (
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div>
              <div className="font-medium">{selectedHardware.name}</div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(selectedHardware.selling_price, 'INR')}/ft × {widthFt}ft
              </div>
            </div>
            <div className="text-lg font-bold">
              {formatCurrency(selectedHardware.selling_price * widthFt, 'INR')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
