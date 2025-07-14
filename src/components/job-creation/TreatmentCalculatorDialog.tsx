
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TreatmentCalculatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatmentData: any) => void;
  treatmentType: string;
}

export const TreatmentCalculatorDialog = ({
  isOpen,
  onClose,
  onSave,
  treatmentType
}: TreatmentCalculatorDialogProps) => {
  const [formData, setFormData] = useState({
    treatmentType: treatmentType,
    productName: '',
    quantity: 1,
    railWidth: 120,
    curtainDrop: 200,
    fabricType: '',
    color: '',
    materialCost: 0,
    laborCost: 0,
    notes: ''
  });

  const handleSave = () => {
    const totalPrice = formData.materialCost + formData.laborCost;
    
    const treatmentData = {
      ...formData,
      totalPrice,
      measurements: {
        rail_width: formData.railWidth,
        drop: formData.curtainDrop
      },
      fabricDetails: {
        fabric_type: formData.fabricType,
        color: formData.color
      },
      treatmentDetails: {
        product_name: formData.productName,
        notes: formData.notes
      },
      calculationDetails: {
        material_cost: formData.materialCost,
        labor_cost: formData.laborCost,
        total_price: totalPrice
      }
    };

    console.log("Saving treatment data:", treatmentData);
    onSave(treatmentData);
  };

  const handleReset = () => {
    setFormData({
      treatmentType: treatmentType,
      productName: '',
      quantity: 1,
      railWidth: 120,
      curtainDrop: 200,
      fabricType: '',
      color: '',
      materialCost: 0,
      laborCost: 0,
      notes: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleReset();
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Treatment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="treatmentType">Treatment Type</Label>
              <Select value={formData.treatmentType} onValueChange={(value) => setFormData({...formData, treatmentType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curtains">Curtains</SelectItem>
                  <SelectItem value="blinds">Blinds</SelectItem>
                  <SelectItem value="shutters">Shutters</SelectItem>
                  <SelectItem value="roman_blinds">Roman Blinds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData({...formData, productName: e.target.value})}
                placeholder="Enter product name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Measurements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="railWidth">Rail Width (cm)</Label>
                <Input
                  id="railWidth"
                  type="number"
                  value={formData.railWidth}
                  onChange={(e) => setFormData({...formData, railWidth: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="curtainDrop">Drop (cm)</Label>
                <Input
                  id="curtainDrop"
                  type="number"
                  value={formData.curtainDrop}
                  onChange={(e) => setFormData({...formData, curtainDrop: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          {/* Fabric Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fabric Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fabricType">Fabric Type</Label>
                <Input
                  id="fabricType"
                  value={formData.fabricType}
                  onChange={(e) => setFormData({...formData, fabricType: e.target.value})}
                  placeholder="e.g., Linen, Cotton"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  placeholder="e.g., Navy Blue"
                />
              </div>
            </div>
          </div>

          {/* Costs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Costs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="materialCost">Material Cost</Label>
                <Input
                  id="materialCost"
                  type="number"
                  step="0.01"
                  value={formData.materialCost}
                  onChange={(e) => setFormData({...formData, materialCost: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="laborCost">Labor Cost</Label>
                <Input
                  id="laborCost"
                  type="number"
                  step="0.01"
                  value={formData.laborCost}
                  onChange={(e) => setFormData({...formData, laborCost: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="text-lg font-bold text-green-600">
              Total: ${(formData.materialCost + formData.laborCost).toFixed(2)}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave}>
              Save Treatment
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
