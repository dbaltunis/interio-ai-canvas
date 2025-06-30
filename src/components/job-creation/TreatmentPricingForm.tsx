
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TreatmentFormFields } from "./TreatmentFormFields";
import { TreatmentPricingDisplay } from "./TreatmentPricingDisplay";
import { TreatmentFormActions } from "./TreatmentFormActions";

interface TreatmentPricingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatmentData: any) => void;
  treatmentType: string;
  surfaceType: string;
}

export const TreatmentPricingForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  treatmentType, 
  surfaceType 
}: TreatmentPricingFormProps) => {
  const [formData, setFormData] = useState({
    product_name: "",
    material_cost: 0,
    labor_cost: 0,
    quantity: 1,
    fabric_type: "",
    color: "",
    pattern: "",
    hardware: "",
    mounting_type: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalPrice = (formData.material_cost + formData.labor_cost) * formData.quantity;
    
    const treatmentData = {
      ...formData,
      treatment_type: treatmentType,
      total_price: totalPrice,
      unit_price: formData.material_cost + formData.labor_cost,
      status: "planned"
    };

    onSave(treatmentData);
    onClose();
    
    // Reset form
    setFormData({
      product_name: "",
      material_cost: 0,
      labor_cost: 0,
      quantity: 1,
      fabric_type: "",
      color: "",
      pattern: "",
      hardware: "",
      mounting_type: "",
      notes: ""
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add {treatmentType} to {surfaceType === 'wall' ? 'Wall' : 'Window'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <TreatmentFormFields 
            formData={formData}
            treatmentType={treatmentType}
            onInputChange={handleInputChange}
          />

          <TreatmentPricingDisplay 
            materialCost={formData.material_cost}
            laborCost={formData.labor_cost}
            quantity={formData.quantity}
          />

          <TreatmentFormActions 
            onCancel={onClose}
            onSubmit={handleSubmit}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
