
import React, { useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from './calculationUtils';
import { useProductTemplates } from '@/hooks/useProductTemplates';
import { useHeadingOptions } from '@/hooks/useHeadingOptions';
import { useHardwareOptions } from '@/hooks/useComponentOptions';
import { useServiceOptions } from '@/hooks/useServiceOptions';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { HemEditDialog } from './HemEditDialog';
import { TreatmentDetailsCard } from './components/TreatmentDetailsCard';
import { CurtainConfigurationCard } from './components/CurtainConfigurationCard';
import { TemplateOptionsCard } from './components/TemplateOptionsCard';
import { MeasurementsCard } from './components/MeasurementsCard';
import { FabricSelectionCard } from './components/FabricSelectionCard';
import { CalculationResultsCard } from './components/CalculationResultsCard';
import { useCalculatorState } from './hooks/useCalculatorState';
import { useCalculatorLogic } from './hooks/useCalculatorLogic';

interface EnhancedTreatmentCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatmentData: any) => void;
  treatmentType: string;
}

export const EnhancedTreatmentCalculator = ({ 
  isOpen, 
  onClose, 
  onSave, 
  treatmentType 
}: EnhancedTreatmentCalculatorProps) => {
  // Use actual product templates from database
  const { templates, isLoading: templatesLoading } = useProductTemplates();
  const { data: allHeadingOptions } = useHeadingOptions();
  const { data: hardwareOptions = [] } = useHardwareOptions();
  const { data: serviceOptions = [] } = useServiceOptions();
  const { data: businessSettings } = useBusinessSettings();
  
  // Find matching template for the treatment type
  const matchingTemplate = templates?.find(template => {
    const templateName = template.name?.toLowerCase()?.trim();
    const searchType = treatmentType?.toLowerCase()?.trim();
    return templateName === searchType && template.active;
  });

  // Initialize state management hooks
  const {
    formData,
    updateFormData,
    fabricOrientation,
    setFabricOrientation,
    dontUpdateTotalPrice,
    setDontUpdateTotalPrice,
    isHemDialogOpen,
    setIsHemDialogOpen,
    hemConfig,
    setHemConfig,
    resetToDefaults
  } = useCalculatorState(treatmentType, businessSettings);

  // Auto-save functionality
  const storageKey = `treatment-draft-${treatmentType}`;
  
  // Apply template data when dialog opens
  useEffect(() => {
    if (isOpen && matchingTemplate) {
      // Clear any existing draft and start fresh
      localStorage.removeItem(storageKey);
      resetToDefaults(matchingTemplate, businessSettings);
    } else if (isOpen && !matchingTemplate) {
      // No template found, use defaults
      localStorage.removeItem(storageKey);
      resetToDefaults(null, businessSettings);
    }
  }, [isOpen, storageKey, businessSettings, matchingTemplate, treatmentType, resetToDefaults]);

  // Auto-save form data when it changes
  const autoSave = useCallback(() => {
    if (!isOpen) return;
    
    const draftData = {
      formData,
      hemConfig,
      fabricOrientation,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(draftData));
  }, [formData, hemConfig, fabricOrientation, isOpen, storageKey]);

  // Auto-save after changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(autoSave, 1000);
    return () => clearTimeout(timeoutId);
  }, [autoSave]);

  // Clear draft when successfully saved
  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Get actual lining options based on template's lining component IDs
  const liningOptions = React.useMemo(() => {
    const templateLiningIds = matchingTemplate?.components?.lining ? 
      Object.keys(matchingTemplate.components.lining).filter(
        id => matchingTemplate.components.lining[id] === true
      ) : [];
    
    return templateLiningIds.length > 0 
      ? templateLiningIds.map(id => ({
          value: id,
          label: 'Lining',
          price: 10
        }))
      : [
          { value: 'standard', label: 'Standard Lining', price: 25 },
          { value: 'blackout', label: 'Blackout Lining', price: 35 },
          { value: 'thermal', label: 'Thermal Lining', price: 45 }
        ];
  }, [matchingTemplate]);

  // Get actual heading options based on template's headings component IDs
  const headingOptions = React.useMemo(() => {
    if (!allHeadingOptions) return [];
    
    const templateHeadingIds = matchingTemplate?.components?.headings ? 
      Object.keys(matchingTemplate.components.headings).filter(
        id => matchingTemplate.components.headings[id] === true
      ) : [];
    
    return templateHeadingIds.length > 0
      ? allHeadingOptions
          .filter(option => templateHeadingIds.includes(option.id))
          .map(option => ({
            value: option.name,
            label: option.name,
            fullness: option.fullness,
            price: option.price
          }))
      : allHeadingOptions.map(option => ({
          value: option.name,
          label: option.name,
          fullness: option.fullness,
          price: option.price
        }));
  }, [matchingTemplate, allHeadingOptions]);

  // Update treatment name when template changes
  useEffect(() => {
    if (matchingTemplate) {
      updateFormData({
        treatmentName: matchingTemplate.name,
        laborRate: matchingTemplate.calculation_rules?.labor_rate || 45,
        markupPercentage: matchingTemplate.calculation_rules?.markup_percentage || 40
      });
    }
  }, [matchingTemplate, updateFormData]);

  // Use calculation logic hook
  const { calculation, calculationBreakdown } = useCalculatorLogic(
    formData,
    hemConfig,
    matchingTemplate,
    liningOptions,
    businessSettings
  );

  const handleHeadingChange = (headingValue: string) => {
    const heading = headingOptions.find(h => h.value === headingValue);
    if (heading) {
      updateFormData({
        headingStyle: heading.value,
        headingFullness: heading.fullness.toString()
      });
    }
  };

  const handleHemSave = (newHemConfig: typeof hemConfig) => {
    setHemConfig(newHemConfig);
  };

  const handleFabricSelect = (fabricId: string, fabric: any) => {
    updateFormData({
      selectedFabric: fabric,
      fabricName: fabric.name || fabric.fabricName || formData.fabricName,
      fabricWidth: fabric.width ? fabric.width.toString() : formData.fabricWidth,
      fabricPricePerYard: fabric.cost_per_unit ? fabric.cost_per_unit.toString() : fabric.pricePerUnit ? fabric.pricePerUnit.toString() : formData.fabricPricePerYard,
      verticalRepeat: fabric.verticalRepeat ? fabric.verticalRepeat.toString() : "0",
      horizontalRepeat: fabric.horizontalRepeat ? fabric.horizontalRepeat.toString() : "0"
    });
  };

  const handleSave = () => {
    if (!calculation) return;

    const treatmentData = {
      treatment_name: formData.treatmentName,
      treatment_type: treatmentType,
      template_id: matchingTemplate?.id,
      quantity: formData.quantity,
      measurements: {
        rail_width: formData.railWidth,
        curtain_drop: formData.curtainDrop,
        pooling: formData.curtainPooling,
        return_depth: formData.returnDepth
      },
      fabric_details: {
        name: formData.fabricName,
        width: formData.fabricWidth,
        price_per_yard: formData.fabricPricePerYard,
        vertical_repeat: formData.verticalRepeat,
        horizontal_repeat: formData.horizontalRepeat,
        orientation: fabricOrientation,
        color: formData.selectedFabric?.color,
        pattern: formData.selectedFabric?.pattern,
        type: formData.selectedFabric?.type,
        fabric_id: formData.selectedFabric?.id
      },
      options: {
        heading_style: formData.headingStyle,
        fullness: formData.headingFullness,
        lining: formData.lining,
        hardware: formData.hardware
      },
      hem_configuration: hemConfig,
      pricing: {
        fabric_cost: calculation.fabricCost,
        labor_cost: calculation.laborCost,
        features_cost: calculation.featuresCost,
        subtotal: calculation.subtotal,
        total: calculation.total,
        unit_price: calculation.total / formData.quantity
      },
      calculation_breakdown: calculationBreakdown,
      calculation_details: calculation.details,
      template_used: matchingTemplate
    };

    onSave(treatmentData);
    clearDraft();
    onClose();
  };

  // Show loading state
  if (templatesLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <div className="text-center py-8">Loading template configuration...</div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error if no matching template found
  if (!matchingTemplate) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Template Not Found
            </DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No template found for "{treatmentType}". Please create a product template with this exact name in Settings &gt; Product Templates.
              {templates && templates.length > 0 && (
                <div className="mt-2">
                  Available templates: {templates.filter(t => t.active).map(t => t.name).join(', ')}
                </div>
              )}
            </AlertDescription>
          </Alert>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {matchingTemplate.name} Calculator
            <Badge variant="outline">{matchingTemplate.calculation_method}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Template Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <h3 className="font-medium">Template: {matchingTemplate.name}</h3>
                <div className="flex gap-2">
                  <Badge variant="outline">{matchingTemplate.product_type}</Badge>
                  <Badge variant="outline">{matchingTemplate.calculation_method}</Badge>
                </div>
                {matchingTemplate.description && (
                  <p className="text-sm text-muted-foreground">{matchingTemplate.description}</p>
                )}
              </div>
            </div>

            <TreatmentDetailsCard
              treatmentName={formData.treatmentName}
              quantity={formData.quantity}
              calculation={calculation}
              onTreatmentNameChange={(name) => updateFormData({ treatmentName: name })}
              onQuantityChange={(quantity) => updateFormData({ quantity })}
            />

            <CurtainConfigurationCard
              quantity={formData.quantity}
              hemConfig={hemConfig}
              productCategory={matchingTemplate?.product_category}
              onQuantityChange={(quantity) => updateFormData({ quantity })}
              onHemEditClick={() => setIsHemDialogOpen(true)}
            />

            <TemplateOptionsCard
              matchingTemplate={matchingTemplate}
              formData={formData}
              liningOptions={liningOptions}
              headingOptions={headingOptions}
              hardwareOptions={hardwareOptions}
              serviceOptions={serviceOptions}
              onFormDataChange={updateFormData}
              onHeadingChange={handleHeadingChange}
            />
          </div>

          {/* Right Column - Measurements and Calculations */}
          <div className="space-y-6">
            <MeasurementsCard
              railWidth={formData.railWidth}
              curtainDrop={formData.curtainDrop}
              curtainPooling={formData.curtainPooling}
              onMeasurementChange={(field, value) => updateFormData({ [field]: value })}
            />

            <FabricSelectionCard
              selectedFabricId={formData.selectedFabric?.id}
              onSelectFabric={handleFabricSelect}
              setFabricOrientation={setFabricOrientation}
            />

            <CalculationResultsCard
              calculationBreakdown={calculationBreakdown}
              matchingTemplate={matchingTemplate}
              dontUpdateTotalPrice={dontUpdateTotalPrice}
              onDontUpdatePriceChange={setDontUpdateTotalPrice}
              hemConfig={hemConfig}
              formData={formData}
              businessSettings={businessSettings}
              liningOptions={liningOptions}
            />
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            {calculation ? formatCurrency(calculation.total) : "$0.00"}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!calculation}>
              Save
            </Button>
          </div>
        </div>

        {/* Hem Edit Dialog */}
        <HemEditDialog
          isOpen={isHemDialogOpen}
          onClose={() => setIsHemDialogOpen(false)}
          onSave={handleHemSave}
          initialValues={hemConfig}
          treatmentType={treatmentType}
        />
      </DialogContent>
    </Dialog>
  );
};
