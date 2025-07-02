import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { useWindowCoveringOptions } from "@/hooks/useWindowCoveringOptions";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { useTreatmentTypes } from "@/hooks/useTreatmentTypes";
import { useFabricCalculation } from "./treatment-pricing/useFabricCalculation";
import { useTreatmentFormData } from "./treatment-pricing/useTreatmentFormData";
import { TreatmentPricingHeader } from "./treatment-pricing/TreatmentPricingHeader";
import { TreatmentMeasurementsCard } from "./treatment-pricing/TreatmentMeasurementsCard";
import { FabricDetailsCard } from "./treatment-pricing/FabricDetailsCard";
import { WindowCoveringOptionsCard } from "./treatment-pricing/WindowCoveringOptionsCard";
import { CostSummaryCard } from "./treatment-pricing/CostSummaryCard";
import { TreatmentQuantityField } from "./treatment-pricing/TreatmentQuantityField";

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
  const { windowCoverings } = useWindowCoverings();
  const [selectedWindowCovering, setSelectedWindowCovering] = useState<any>(null);

  // Filter window coverings by treatment type
  const filteredWindowCoverings = windowCoverings.filter(wc => 
    wc.name.toLowerCase().includes(treatmentType.toLowerCase()) ||
    treatmentType === 'curtains' && wc.name.toLowerCase().includes('curtain')
  );

  const { formData, setFormData, handleInputChange, resetForm } = useTreatmentFormData(treatmentType, selectedWindowCovering);
  const { options, hierarchicalOptions, isLoading: optionsLoading } = useWindowCoveringOptions(selectedWindowCovering?.id);
  const { data: treatmentTypesData, isLoading: treatmentTypesLoading } = useTreatmentTypes();
  const { calculateFabricUsage, calculateCosts } = useFabricCalculation(formData, options, treatmentTypesData, treatmentType, hierarchicalOptions);

  const costs = calculateCosts();

  // Auto-select window covering when dialog opens
  useEffect(() => {
    if (isOpen && filteredWindowCoverings.length > 0 && !selectedWindowCovering) {
      // Try to find a curtain with making cost first
      const withMakingCost = filteredWindowCoverings.find(wc => wc.making_cost_id);
      const firstMatch = withMakingCost || filteredWindowCoverings[0];
      setSelectedWindowCovering(firstMatch);
    }
  }, [isOpen, filteredWindowCoverings, selectedWindowCovering]);

  // Auto-select required and default options when window covering changes
  useEffect(() => {
    if (selectedWindowCovering && options && options.length > 0) {
      const autoSelectOptions = options
        .filter(option => option.is_required || option.is_default)
        .map(option => option.id);
      
      if (autoSelectOptions.length > 0) {
        setFormData(prev => ({
          ...prev,
          selected_options: [...new Set([...prev.selected_options, ...autoSelectOptions])]
        }));
      }
    }
  }, [selectedWindowCovering, options, setFormData]);

  // Auto-save window covering when selected
  useEffect(() => {
    if (selectedWindowCovering) {
      setFormData(prev => ({
        ...prev,
        product_name: selectedWindowCovering.name || prev.product_name,
        window_covering: selectedWindowCovering
      }));
    }
  }, [selectedWindowCovering, setFormData]);

  const handleSubmit = () => {
    if (!formData.rail_width || !formData.drop) {
      alert('Please enter rail width and drop measurements');
      return;
    }

    const treatmentData = {
      product_name: formData.product_name,
      treatment_type: treatmentType,
      quantity: formData.quantity,
      material_cost: parseFloat(costs.fabricCost),
      labor_cost: parseFloat(costs.laborCost),
      total_price: parseFloat(costs.totalCost),
      unit_price: parseFloat(costs.totalCost) / formData.quantity,
      measurements: {
        rail_width: formData.rail_width,
        drop: formData.drop,
        pooling: formData.pooling,
        fabric_usage: costs.fabricUsage
      },
      fabric_details: {
        fabric_type: formData.fabric_type,
        fabric_code: formData.fabric_code,
        fabric_cost_per_yard: formData.fabric_cost_per_yard,
        fabric_width: formData.fabric_width,
        roll_direction: formData.roll_direction,
        heading_fullness: formData.heading_fullness
      },
      selected_options: formData.selected_options,
      notes: formData.notes || `Calculator generated ${treatmentType} treatment`,
      status: "planned",
      window_covering: selectedWindowCovering,
      calculation_details: costs
    };

    onSave(treatmentData);
    resetForm();
    setSelectedWindowCovering(null);
    onClose();
  };

  const handleClose = () => {
    resetForm();
    setSelectedWindowCovering(null);
    onClose();
  };

  const handleOptionToggle = (optionId: string) => {
    setFormData(prev => {
      const newSelectedOptions = prev.selected_options.includes(optionId)
        ? prev.selected_options.filter(id => id !== optionId)
        : [...prev.selected_options, optionId];
      
      return {
        ...prev,
        selected_options: newSelectedOptions
      };
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background border-b pb-4 mb-4">
          <DialogTitle className="flex items-center text-center text-lg font-semibold">
            <Calculator className="mr-2 h-5 w-5" />
            {treatmentType.charAt(0).toUpperCase() + treatmentType.slice(1)} Calculator
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            Calculate costs with integrated making cost system
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Window Covering Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Window Covering</label>
            <Select
              value={selectedWindowCovering?.id || ''}
              onValueChange={(value) => {
                const wc = windowCoverings.find(w => w.id === value);
                setSelectedWindowCovering(wc || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${treatmentType} window covering`} />
              </SelectTrigger>
              <SelectContent>
                {filteredWindowCoverings.map((wc) => (
                  <SelectItem key={wc.id} value={wc.id}>
                    <div className="flex items-center gap-2">
                      <span>{wc.name}</span>
                      {wc.making_cost_id && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Making Cost
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedWindowCovering && (
            <>
              <TreatmentPricingHeader
                productName={formData.product_name}
                onNameChange={(name) => handleInputChange("product_name", name)}
                windowCovering={selectedWindowCovering}
              />

              <TreatmentQuantityField
                quantity={formData.quantity}
                onQuantityChange={(quantity) => handleInputChange("quantity", quantity)}
              />

              <TreatmentMeasurementsCard
                formData={formData}
                onInputChange={handleInputChange}
              />

              <WindowCoveringOptionsCard
                options={options}
                hierarchicalOptions={hierarchicalOptions}
                optionsLoading={optionsLoading}
                windowCovering={selectedWindowCovering}
                selectedOptions={formData.selected_options}
                onOptionToggle={handleOptionToggle}
              />

              <FabricDetailsCard 
                formData={formData} 
                onInputChange={handleInputChange}
                fabricUsage={costs.fabricUsage}
              />

              <CostSummaryCard 
                costs={costs} 
                treatmentType={treatmentType}
                selectedOptions={formData.selected_options}
                availableOptions={options}
                hierarchicalOptions={hierarchicalOptions}
                formData={formData}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t sticky bottom-0 bg-background">
          <div className="text-sm text-muted-foreground">
            <span>Total: <span className="font-bold text-lg text-primary">{formatCurrency(parseFloat(costs.totalCost || '0'))}</span></span>
            {costs.totalCost && parseFloat(costs.totalCost) > 0 && (
              <span className="ml-4 text-xs">
                Per unit: {formatCurrency(parseFloat(costs.totalCost) / formData.quantity)}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-green-600 hover:bg-green-700"
              disabled={!formData.rail_width || !formData.drop || !selectedWindowCovering}
            >
              Save Treatment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};