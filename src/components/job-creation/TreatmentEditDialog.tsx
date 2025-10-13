
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useUpdateTreatment } from "@/hooks/useTreatments";
import { useToast } from "@/hooks/use-toast";

interface TreatmentEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  treatment: any;
  onSave: (treatment: any) => void;
}

export const TreatmentEditDialog = ({
  isOpen,
  onClose,
  treatment,
  onSave
}: TreatmentEditDialogProps) => {
  const { toast } = useToast();
  const updateTreatment = useUpdateTreatment();
  
  const [formData, setFormData] = useState({
    product_name: '',
    quantity: 1,
    material_cost: 0,
    labor_cost: 0,
    total_price: 0,
    notes: '',
    fabric_details: {
      fabric_type: '',
      fabric_code: '',
      heading_fullness: ''
    } as any,
    measurements: {
      rail_width: 0,
      drop: 0,
      fabric_usage: 0
    }
  });

  useEffect(() => {
    if (treatment) {
      setFormData({
        product_name: treatment.product_name || '',
        quantity: treatment.quantity || 1,
        material_cost: treatment.material_cost || 0,
        labor_cost: treatment.labor_cost || 0,
        total_price: treatment.total_price || 0,
        notes: treatment.notes || '',
        fabric_details: treatment.fabric_details ? {
          fabric_type: treatment.fabric_details?.fabric_type || '',
          fabric_code: treatment.fabric_details?.fabric_code || '',
          heading_fullness: treatment.fabric_details?.heading_fullness || ''
        } : null,
        measurements: {
          rail_width: treatment.measurements?.rail_width || 0,
          drop: treatment.measurements?.drop || 0,
          fabric_usage: treatment.measurements?.fabric_usage || 0
        }
      });
    }
  }, [treatment]);

  const handleSave = async () => {
    try {
      const updatedTreatment = {
        ...treatment,
        ...formData,
        total_price: formData.material_cost + formData.labor_cost
      };

      await updateTreatment.mutateAsync({
        id: treatment.id,
        ...updatedTreatment
      });

      toast({
        title: "Success",
        description: "Treatment updated successfully",
      });

      onSave(updatedTreatment);
      onClose();
    } catch (error) {
      console.error("Failed to update treatment:", error);
      toast({
        title: "Error",
        description: "Failed to update treatment",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Treatment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="product_name">Product Name</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => setFormData({...formData, product_name: e.target.value})}
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
              <div>
                <Label htmlFor="total_price">Total Price</Label>
                <div className="text-lg font-bold text-green-600 p-2">
                  {formatCurrency(formData.material_cost + formData.labor_cost)}
                </div>
              </div>
            </div>
          </div>

          {/* Costs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Costs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="material_cost">Material Cost</Label>
                <Input
                  id="material_cost"
                  type="number"
                  step="0.01"
                  value={formData.material_cost}
                  onChange={(e) => setFormData({...formData, material_cost: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="labor_cost">Labor Cost</Label>
                <Input
                  id="labor_cost"
                  type="number"
                  step="0.01"
                  value={formData.labor_cost}
                  onChange={(e) => setFormData({...formData, labor_cost: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Measurements</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rail_width">Rail Width (cm)</Label>
                <Input
                  id="rail_width"
                  type="number"
                  value={formData.measurements.rail_width}
                  onChange={(e) => setFormData({
                    ...formData,
                    measurements: {
                      ...formData.measurements,
                      rail_width: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="drop">Drop (cm)</Label>
                <Input
                  id="drop"
                  type="number"
                  value={formData.measurements.drop}
                  onChange={(e) => setFormData({
                    ...formData,
                    measurements: {
                      ...formData.measurements,
                      drop: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="fabric_usage">Fabric Usage (m)</Label>
                <Input
                  id="fabric_usage"
                  type="number"
                  step="0.01"
                  value={formData.measurements.fabric_usage}
                  onChange={(e) => setFormData({
                    ...formData,
                    measurements: {
                      ...formData.measurements,
                      fabric_usage: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Fabric Details - Only show for treatments that use fabric */}
          {formData.fabric_details && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fabric Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fabric_type">Fabric Type</Label>
                  <Input
                    id="fabric_type"
                    value={formData.fabric_details.fabric_type || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      fabric_details: {
                        ...formData.fabric_details,
                        fabric_type: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="fabric_code">Fabric Code</Label>
                  <Input
                    id="fabric_code"
                    value={formData.fabric_details.fabric_code || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      fabric_details: {
                        ...formData.fabric_details,
                        fabric_code: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="heading_fullness">Heading Fullness</Label>
                <Input
                  id="heading_fullness"
                  value={formData.fabric_details.heading_fullness || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    fabric_details: {
                      ...formData.fabric_details,
                      heading_fullness: e.target.value
                    }
                  })}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes about this treatment..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={updateTreatment.isPending}>
              {updateTreatment.isPending ? 'Saving...' : 'Save Changes'}
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
