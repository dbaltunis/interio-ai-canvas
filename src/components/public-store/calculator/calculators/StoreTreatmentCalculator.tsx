import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Send } from "lucide-react";
import { formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { StoreQuoteRequestForm } from "../StoreQuoteRequestForm";
import { MeasurementVisualCore } from "@/components/shared/measurement-visual/MeasurementVisualCore";
import { useFabricCalculator } from "@/components/shared/measurement-visual/hooks/useFabricCalculator";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface StoreTreatmentCalculatorProps {
  product: any;
  storeData: any;
  onSubmitQuote: (quoteData: any) => void;
  onAddToCart?: (configuration: Record<string, any>, estimatedPrice: number) => void;
}

export const StoreTreatmentCalculator = ({ product, storeData, onSubmitQuote, onAddToCart }: StoreTreatmentCalculatorProps) => {
  const { data: templates } = useCurtainTemplates();
  
  // Auto-load template from product if assigned
  const assignedTemplateId = product.template_id || "";
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(assignedTemplateId);
  
  const [measurements, setMeasurements] = useState({
    rail_width: "",
    drop: "",
    pooling_amount: "0",
  });
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  
  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);
  
  const treatmentData = selectedTemplate ? {
    template: {
      id: selectedTemplate.id,
      name: selectedTemplate.name,
      curtain_type: selectedTemplate.curtain_type,
      fullness_ratio: selectedTemplate.fullness_ratio,
      header_allowance: selectedTemplate.header_allowance,
      bottom_hem: selectedTemplate.bottom_hem,
      side_hems: selectedTemplate.side_hems,
      seam_hems: selectedTemplate.seam_hems,
      return_left: selectedTemplate.return_left,
      return_right: selectedTemplate.return_right,
      waste_percent: selectedTemplate.waste_percent,
      compatible_hardware: selectedTemplate.compatible_hardware,
    },
    fabric: {
      id: product.inventory_item.id,
      name: product.inventory_item.name,
      fabric_width: product.inventory_item.fabric_width || 137,
      price_per_meter: product.inventory_item.selling_price || product.inventory_item.unit_price || 0,
      unit_price: product.inventory_item.unit_price,
      selling_price: product.inventory_item.selling_price,
    }
  } : undefined;

  const calculation = useFabricCalculator({ measurements, treatmentData });

  const handleCalculate = () => {
    if (calculation && calculation.totalCost > 0) {
      setShowQuoteForm(true);
    }
  };

  const handleSubmitQuote = (customerInfo: any) => {
    onSubmitQuote({
      ...customerInfo,
      configuration_data: {
        measurements,
        product_name: product.inventory_item?.name,
        product_category: product.inventory_item?.category,
        template_name: selectedTemplate?.name,
        calculation,
      },
      quote_data: {
        estimated_price: calculation?.totalCost || 0,
        currency: 'NZD',
        calculation_details: calculation,
      },
    });
    setShowQuoteForm(false);
    setMeasurements({ rail_width: "", drop: "", pooling_amount: "0" });
    setSelectedTemplateId("");
  };

  const categoryTemplates = templates?.filter(t => {
    const productCategory = product.inventory_item?.category?.toLowerCase();
    const templateCategory = t.treatment_category?.toLowerCase() || t.curtain_type?.toLowerCase();
    return !templateCategory || templateCategory.includes(productCategory) || productCategory.includes(templateCategory);
  }) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {selectedTemplate?.name || 'Treatment Calculator'}
          </CardTitle>
          <CardDescription>
            {selectedTemplate 
              ? `${product.inventory_item?.name} - Configured with ${selectedTemplate.name}` 
              : 'Configure your treatment and get an instant quote'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Rail Width (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="200"
                  value={measurements.rail_width}
                  onChange={(e) => setMeasurements({ ...measurements, rail_width: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="drop">Drop Height (cm)</Label>
                <Input
                  id="drop"
                  type="number"
                  placeholder="220"
                  value={measurements.drop}
                  onChange={(e) => setMeasurements({ ...measurements, drop: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pooling">Pooling Amount (cm)</Label>
              <Input
                id="pooling"
                type="number"
                placeholder="0"
                value={measurements.pooling_amount}
                onChange={(e) => setMeasurements({ ...measurements, pooling_amount: e.target.value })}
              />
            </div>
          </div>

          {measurements.rail_width && measurements.drop && calculation && (
            <>
              <Separator />
              <div className="bg-muted/50 rounded-lg overflow-hidden">
                <MeasurementVisualCore
                  measurements={measurements}
                  treatmentData={treatmentData}
                  config={{ compact: true, readOnly: true }}
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Calculation Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fabric Required:</span>
                    <span className="font-medium">{calculation.linearMeters.toFixed(2)}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Widths:</span>
                    <span className="font-medium">{calculation.widthsRequired}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fullness:</span>
                    <span className="font-medium">{calculation.fullnessRatio}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Drop:</span>
                    <span className="font-medium">{calculation.totalDrop.toFixed(0)}cm</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estimated Price:</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--store-primary)' }}>
                    {formatCurrency(calculation.totalCost, 'NZD')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on {calculation.linearMeters.toFixed(2)}m @ {formatCurrency(calculation.pricePerMeter, 'NZD')}/m
                </p>
              </div>
            </>
          )}

          {calculation && (
            <div className="space-y-2">
              <Button
                onClick={handleCalculate}
                className="w-full"
                size="lg"
                style={{ backgroundColor: 'var(--store-primary)' }}
                disabled={!calculation || calculation.totalCost === 0}
              >
                Get Quote
              </Button>

              {onAddToCart && calculation && calculation.totalCost > 0 && (
                <Button
                  onClick={() => {
                    onAddToCart(
                      {
                        measurements,
                        template_id: selectedTemplateId,
                        template_name: selectedTemplate?.name,
                        product_name: product.inventory_item?.name,
                        calculation,
                      },
                      calculation.totalCost
                    );
                  }}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Add to Cart
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showQuoteForm && calculation && (
        <StoreQuoteRequestForm
          estimatedPrice={calculation.totalCost}
          onSubmit={handleSubmitQuote}
          onCancel={() => setShowQuoteForm(false)}
        />
      )}
    </div>
  );
};
