
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
  
  const [formData, setFormData] = useState<TreatmentFormData>({
    // Basic Details
    treatmentName: treatmentType === 'curtains' ? 'Custom Curtains' : treatmentType === 'roman-shades' ? 'Roman Shades' : treatmentType,
    quantity: 1,
    windowPosition: "center",
    windowType: "single",
    
    // Treatment Specifications
    headingStyle: "",
    headingFullness: "2.5",
    lining: "",
    mounting: "inside",
    
    // Measurements
    railWidth: "",
    curtainDrop: "",
    curtainPooling: "0",
    returnDepth: "4",
    
    // Fabric Selection
    fabricMode: "library",
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculation = calculateTotalPrice(formData);

  const handleSave = () => {
    onSave({
      ...formData,
      price: calculation.total,
      calculation: calculation
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              Total: <span className="font-bold text-lg text-primary">{formatCurrency(calculation.total)}</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-slate-600 hover:bg-slate-700">
                Save Treatment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
