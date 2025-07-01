
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { TreatmentCalculatorDialogProps, TreatmentFormData, AdditionalFeature } from './calculator/types';
import { calculateTotalPrice, formatCurrency } from './calculator/calculationUtils';
import { availableFeatures } from './calculator/mockData';
import { BasicDetailsTab } from './calculator/BasicDetailsTab';
import { FabricSelectionTab } from './calculator/FabricSelectionTab';
import { FeaturesTab } from './calculator/FeaturesTab';
import { CalculationTab } from './calculator/CalculationTab';

export const TreatmentCalculatorDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  treatmentType 
}: TreatmentCalculatorDialogProps) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'fabric' | 'features' | 'calculation'>('basic');
  
  const getInitialFormData = (): TreatmentFormData => ({
    // Basic Details
    treatmentName: treatmentType === 'curtains' ? 'Curtains' : treatmentType === 'roman-shades' ? 'Roman Shades' : treatmentType,
    quantity: 1,
    windowPosition: "left",
    windowType: "single",
    
    // Treatment Specifications
    headingStyle: "pencil-pleat",
    headingFullness: "2.5",
    lining: "none",
    mounting: "inside",
    
    // Measurements
    railWidth: "",
    curtainDrop: "",
    curtainPooling: "0",
    returnDepth: "4",
    
    // Fabric Selection
    fabricMode: "manual",
    selectedFabric: null,
    fabricName: "",
    fabricWidth: "140",
    fabricPricePerYard: "",
    verticalRepeat: "0",
    horizontalRepeat: "0",
    
    // Hardware
    hardware: "",
    hardwareFinish: "",
    
    // Additional Features
    additionalFeatures: [] as AdditionalFeature[],
    
    // Pricing
    laborRate: 65,
    markupPercentage: 40,
  });
  
  const [formData, setFormData] = useState<TreatmentFormData>(getInitialFormData());

  // Reset form when dialog opens
  useState(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setActiveTab('basic');
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculation = calculateTotalPrice(formData);

  const handleSave = () => {
    if (!formData.railWidth || !formData.curtainDrop) {
      alert('Please enter rail width and curtain drop measurements');
      return;
    }

    const treatmentData = {
      product_name: formData.treatmentName,
      treatment_type: treatmentType === 'curtains' ? 'Curtains' : 'Roman Shades',
      quantity: formData.quantity,
      material_cost: calculation.fabricCost,
      labor_cost: calculation.laborCost,
      total_price: calculation.total,
      unit_price: calculation.total / formData.quantity,
      measurements: {
        rail_width: formData.railWidth,
        drop: formData.curtainDrop,
        pooling: formData.curtainPooling,
        return_depth: formData.returnDepth,
        fabric_usage: calculation.fabricYards.toString()
      },
      fabric_details: {
        fabric_type: formData.fabricName || formData.selectedFabric?.name || '',
        fabric_code: formData.selectedFabric?.code || '',
        fabric_cost_per_yard: formData.fabricPricePerYard || formData.selectedFabric?.pricePerYard?.toString() || '0',
        fabric_width: formData.fabricWidth,
        roll_direction: 'horizontal',
        heading_fullness: formData.headingFullness
      },
      treatment_details: {
        headingStyle: formData.headingStyle,
        headingFullness: formData.headingFullness,
        lining: formData.lining,
        mounting: formData.mounting,
        windowPosition: formData.windowPosition,
        windowType: formData.windowType,
        hardware: formData.hardware,
        hardwareFinish: formData.hardwareFinish
      },
      selected_options: formData.additionalFeatures.filter(f => f.selected).map(f => f.id),
      notes: `Calculator generated treatment. Features: ${formData.additionalFeatures.filter(f => f.selected).map(f => f.name).join(', ')}`,
      status: "planned",
      calculation_details: calculation
    };

    onSave(treatmentData);
    setFormData(getInitialFormData()); // Reset form
    onClose();
  };

  const handleClose = () => {
    setFormData(getInitialFormData()); // Reset form on close
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            {treatmentType === 'curtains' ? 'Curtain' : treatmentType === 'roman-shades' ? 'Roman Shade' : 'Treatment'} Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Navigation Tabs */}
          <div className="flex space-x-1 border-b mb-4">
            {[
              { key: 'basic', label: 'Basic Details' },
              { key: 'fabric', label: 'Fabric Selection' },
              { key: 'features', label: 'Features' },
              { key: 'calculation', label: 'Calculation' }
            ].map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.key as any)}
                className="rounded-b-none"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'basic' && (
              <BasicDetailsTab formData={formData} onInputChange={handleInputChange} />
            )}

            {activeTab === 'fabric' && (
              <FabricSelectionTab formData={formData} onInputChange={handleInputChange} />
            )}

            {activeTab === 'features' && (
              <FeaturesTab formData={formData} onInputChange={handleInputChange} />
            )}

            {activeTab === 'calculation' && (
              <CalculationTab formData={formData} calculation={calculation} />
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <span>Total: <span className="font-bold text-lg text-primary">{formatCurrency(calculation.total)}</span></span>
              {calculation.total > 0 && (
                <span className="ml-4 text-xs">
                  Per panel: {formatCurrency(calculation.total / formData.quantity)}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-green-600 hover:bg-green-700"
                disabled={!formData.railWidth || !formData.curtainDrop}
              >
                Save Treatment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
