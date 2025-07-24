
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Ruler, Palette, Settings, Save, X } from "lucide-react";
import { useTreatmentFormData } from "../job-creation/treatment-pricing/useTreatmentFormData";
import { FabricDetailsCard } from "../job-creation/treatment-pricing/FabricDetailsCard";
import { TreatmentMeasurementsCard } from "../job-creation/treatment-pricing/TreatmentMeasurementsCard";
import { CostSummaryCard } from "../job-creation/treatment-pricing/CostSummaryCard";
import { TreatmentOptionsCard } from "../job-creation/treatment-pricing/TreatmentOptionsCard";
import { useTreatmentTypes } from "@/hooks/useTreatmentTypes";

interface MeasurementWorksheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (measurementData: any) => void;
  client?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
  // Job creation specific props
  roomId?: string;
  surfaceId?: string;
  treatmentType?: string;
  isJobFlow?: boolean;
}

export const MeasurementWorksheet = ({ 
  isOpen, 
  onClose, 
  onSave, 
  client,
  project,
  roomId,
  surfaceId,
  treatmentType = "Curtains",
  isJobFlow = false
}: MeasurementWorksheetProps) => {
  const [measuredBy, setMeasuredBy] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  const { formData, setFormData, handleInputChange, resetForm, fabricUsage, costs } = useTreatmentFormData({
    treatmentType,
    surfaceId: surfaceId || '',
    measurements: {}
  });

  const { data: treatmentTypesData, isLoading: treatmentTypesLoading } = useTreatmentTypes();

  // Initialize form when dialog opens
  useEffect(() => {
    if (isOpen && treatmentType) {
      setFormData(prev => ({
        ...prev,
        product_name: treatmentType
      }));
    }
  }, [isOpen, treatmentType, setFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const measurementData = {
      // Basic measurement info
      measured_by: measuredBy,
      measured_at: new Date().toISOString(),
      notes: additionalNotes,
      
      // Treatment measurements
      measurements: {
        rail_width: formData.rail_width,
        drop: formData.drop,
        pooling: formData.pooling,
        quantity: formData.quantity,
        fabric_usage_yards: fabricUsage.yards,
        fabric_usage_meters: fabricUsage.meters,
        fabric_usage_details: fabricUsage.details,
        fabric_orientation: fabricUsage.fabricOrientation,
        seams_required: fabricUsage.seamsRequired,
        seam_labor_hours: fabricUsage.seamLaborHours,
        widths_required: fabricUsage.widthsRequired
      },
      
      // Fabric details
      fabric_details: {
        fabric_type: formData.fabric_type,
        fabric_code: formData.fabric_code,
        fabric_cost_per_yard: formData.fabric_cost_per_yard,
        fabric_width: formData.fabric_width,
        roll_direction: formData.roll_direction,
        heading_fullness: formData.heading_fullness
      },
      
      // Treatment configuration
      treatment_details: {
        product_name: formData.product_name,
        header_hem: formData.header_hem,
        bottom_hem: formData.bottom_hem,
        side_hem: formData.side_hem,
        seam_hem: formData.seam_hem,
        selected_options: formData.selected_options,
        custom_labor_rate: formData.custom_labor_rate
      },
      
      // Cost calculations
      calculation_details: {
        fabric_cost: costs.fabricCost,
        labor_cost: costs.laborCost,
        total_cost: costs.totalCost,
        unit_price: costs.totalCost / formData.quantity,
        cost_breakdown: costs.breakdown
      },
      
      // Pricing for job flow
      material_cost: parseFloat(costs.fabricCost) || 0,
      labor_cost: parseFloat(costs.laborCost) || 0,
      total_price: parseFloat(costs.totalCost) || 0,
      
      // Job flow specific data
      roomId,
      surfaceId,
      treatmentType,
      isJobFlow
    };

    onSave(measurementData);
    resetForm();
    setMeasuredBy("");
    setAdditionalNotes("");
    onClose();
  };

  const handleClose = () => {
    resetForm();
    setMeasuredBy("");
    setAdditionalNotes("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background border-b pb-4 mb-4">
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            {isJobFlow ? 'Treatment Configuration & Measurements' : 'Measurement Worksheet'}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {client && (
              <span>Client: <Badge variant="secondary">{client.name}</Badge></span>
            )}
            {project && (
              <span>Project: <Badge variant="secondary">{project.name}</Badge></span>
            )}
            {isJobFlow && treatmentType && (
              <span>Treatment: <Badge variant="outline">{treatmentType}</Badge></span>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product_name">Product Name</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => handleInputChange("product_name", e.target.value)}
                    placeholder="e.g., Curtains, Blinds, Shutters"
                  />
                </div>
                <div>
                  <Label htmlFor="measured_by">Measured By</Label>
                  <Input
                    id="measured_by"
                    value={measuredBy}
                    onChange={(e) => setMeasuredBy(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
                  placeholder="Number of units"
                />
              </div>
            </CardContent>
          </Card>

          {/* Measurements Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Measurements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TreatmentMeasurementsCard
                formData={formData}
                onInputChange={handleInputChange}
              />
            </CardContent>
          </Card>

          {/* Treatment Options */}
          {isJobFlow && (
            <TreatmentOptionsCard 
              treatmentTypesData={treatmentTypesData}
              treatmentTypesLoading={treatmentTypesLoading}
              treatmentType={treatmentType}
              selectedOptions={formData.selected_options}
              onOptionToggle={(optionId) => {
                const newSelectedOptions = formData.selected_options.includes(optionId)
                  ? formData.selected_options.filter(id => id !== optionId)
                  : [...formData.selected_options, optionId];
                
                setFormData(prev => ({
                  ...prev,
                  selected_options: newSelectedOptions
                }));
              }}
            />
          )}

          {/* Fabric Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Fabric & Material Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FabricDetailsCard 
                formData={formData} 
                onInputChange={handleInputChange}
                fabricUsage={fabricUsage}
              />
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CostSummaryCard 
                costs={costs} 
                treatmentType={treatmentType}
                selectedOptions={formData.selected_options}
                availableOptions={[]}
                hierarchicalOptions={[]}
                formData={formData}
              />
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Add any additional notes about the measurements, installation requirements, or special considerations..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isJobFlow ? 'Save Treatment & Measurements' : 'Save Measurements'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
