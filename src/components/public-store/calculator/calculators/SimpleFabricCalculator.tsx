import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calculator, Ruler } from "lucide-react";
import { formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { StoreQuoteRequestForm } from "../StoreQuoteRequestForm";
import { TreatmentPreviewEngine } from "@/components/treatment-visualizers/TreatmentPreviewEngine";

interface SimpleFabricCalculatorProps {
  product: any;
  storeData: any;
  onSubmitQuote: (quoteData: any) => void;
  onAddToCart?: (configuration: Record<string, any>, estimatedPrice: number) => void;
}

export const SimpleFabricCalculator = ({ product, storeData, onSubmitQuote, onAddToCart }: SimpleFabricCalculatorProps) => {
  const [measurements, setMeasurements] = useState({
    railWidth: "",
    drop: "",
  });
  const [fullness, setFullness] = useState<string>("medium");
  const [windowType, setWindowType] = useState<string>("standard");
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // Default template configuration for visual preview
  const defaultTemplate = useMemo(() => ({
    id: 'default',
    name: 'Custom Treatment',
    curtain_type: 'curtains',
    treatment_category: 'curtains',
    fullness_ratio: fullness === "light" ? 1.5 : fullness === "medium" ? 2.0 : 2.5,
    header_allowance: 20,
    bottom_hem: 15,
    side_hems: 5,
    seam_hems: 0,
    return_left: 0,
    return_right: 0,
    waste_percent: 10,
  }), [fullness]);

  // Calculate fabric requirements
  const calculation = useMemo(() => {
    const railWidthNum = parseFloat(measurements.railWidth);
    const dropNum = parseFloat(measurements.drop);
    
    if (isNaN(railWidthNum) || isNaN(dropNum) || railWidthNum <= 0 || dropNum <= 0) {
      return null;
    }

    const fullnessMultiplier = fullness === "light" ? 1.5 : fullness === "medium" ? 2.0 : 2.5;
    const fabricWidth = product.inventory_item?.fabric_width || 137;
    
    // Calculate fabric needed
    const fabricWidthCm = railWidthNum * fullnessMultiplier;
    const fabricDropCm = dropNum + 20 + 15; // header + hem allowances
    
    // Calculate number of widths needed
    const widthsNeeded = Math.ceil(fabricWidthCm / fabricWidth);
    
    // Total fabric length in meters
    const totalMeters = (widthsNeeded * fabricDropCm) / 100;
    const totalMetersWithWaste = totalMeters * 1.1; // 10% waste
    
    // Calculate costs
    const fabricPrice = product.inventory_item?.selling_price || product.inventory_item?.unit_price || 0;
    const fabricCost = totalMetersWithWaste * fabricPrice;
    const laborCost = totalMetersWithWaste * 15; // £15 per meter labor estimate
    const totalPrice = fabricCost + laborCost;
    
    return {
      widthsNeeded,
      totalMeters: totalMetersWithWaste,
      fabricCost,
      laborCost,
      totalPrice,
      fabricWidth,
      fullnessMultiplier,
    };
  }, [measurements, fullness, product.inventory_item]);

  const handleSubmitQuote = (customerInfo: any) => {
    onSubmitQuote({
      ...customerInfo,
      configuration_data: {
        measurements,
        fullness,
        windowType,
        product_name: product.inventory_item?.name,
        product_category: product.inventory_item?.category,
      },
      quote_data: {
        estimated_price: calculation?.totalPrice || 0,
        currency: 'NZD',
        calculation_details: calculation,
      },
    });
    setShowQuoteForm(false);
  };

  const railWidthNum = parseFloat(measurements.railWidth);
  const dropNum = parseFloat(measurements.drop);
  const hasValidMeasurements = !isNaN(railWidthNum) && !isNaN(dropNum) && railWidthNum > 0 && dropNum > 0;

  return (
    <div className="space-y-6">
      {/* Visual Preview */}
      {hasValidMeasurements && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">See it on Your Window</CardTitle>
                <CardDescription>
                  Preview shows how {product.inventory_item?.name} will look as {fullness} fullness curtains
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg overflow-hidden min-h-[400px]">
              <TreatmentPreviewEngine
                windowType={windowType}
                treatmentType="curtains"
                measurements={{
                  rail_width: railWidthNum,
                  drop: dropNum,
                  pooling_amount: 0,
                }}
                template={defaultTemplate}
                selectedItems={{
                  fabric: product.inventory_item,
                  material: product.inventory_item,
                }}
                hideDetails={false}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Preview is approximate - book a consultation for exact visualization
            </p>
          </CardContent>
        </Card>
      )}

      {/* Calculator Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculate Your Curtains
          </CardTitle>
          <CardDescription>
            Enter your window measurements for an instant quote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Window Type */}
          <div className="space-y-2">
            <Label htmlFor="window-type">Window Type</Label>
            <Select value={windowType} onValueChange={setWindowType}>
              <SelectTrigger id="window-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Window</SelectItem>
                <SelectItem value="bay">Bay Window</SelectItem>
                <SelectItem value="french_doors">French Doors</SelectItem>
                <SelectItem value="sliding_doors">Sliding Doors</SelectItem>
                <SelectItem value="large">Large Window</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rail-width" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Rail Width (cm)
              </Label>
              <Input
                id="rail-width"
                type="number"
                placeholder="150"
                value={measurements.railWidth}
                onChange={(e) => setMeasurements({ ...measurements, railWidth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drop" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Drop (cm)
              </Label>
              <Input
                id="drop"
                type="number"
                placeholder="220"
                value={measurements.drop}
                onChange={(e) => setMeasurements({ ...measurements, drop: e.target.value })}
              />
            </div>
          </div>

          {/* Fullness Selector */}
          <div className="space-y-2">
            <Label htmlFor="fullness">Fullness</Label>
            <Select value={fullness} onValueChange={setFullness}>
              <SelectTrigger id="fullness">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light (1.5x) - Minimal gathering</SelectItem>
                <SelectItem value="medium">Medium (2x) - Standard fullness</SelectItem>
                <SelectItem value="full">Full (2.5x) - Luxury fullness</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calculation Results */}
          {calculation && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm">Calculation Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fabric widths needed:</span>
                      <span className="font-medium">{calculation.widthsNeeded}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total fabric required:</span>
                      <span className="font-medium">{calculation.totalMeters.toFixed(2)}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fullness ratio:</span>
                      <span className="font-medium">{calculation.fullnessMultiplier}x</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fabric Cost ({calculation.totalMeters.toFixed(2)}m)</span>
                    <span className="font-medium">{formatCurrency(calculation.fabricCost, 'NZD')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Make-Up / Labor</span>
                    <span className="font-medium">{formatCurrency(calculation.laborCost, 'NZD')}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Estimated Price:</span>
                    <span className="text-2xl font-bold" style={{ color: 'var(--store-primary)' }}>
                      {formatCurrency(calculation.totalPrice, 'NZD')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    * Price includes fabric and make-up. Installation quoted separately.
                  </p>
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    onClick={() => setShowQuoteForm(true)}
                    className="w-full"
                    size="lg"
                    style={{ backgroundColor: 'var(--store-primary)' }}
                  >
                    Request Quote
                  </Button>

                  {onAddToCart && (
                    <Button
                      onClick={() => {
                        onAddToCart(
                          {
                            measurements,
                            fullness,
                            windowType,
                            product_name: product.inventory_item?.name,
                            calculation_details: calculation,
                          },
                          calculation.totalPrice
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
              </div>
            </>
          )}

          {!calculation && (
            <p className="text-sm text-muted-foreground text-center">
              Enter measurements above to see pricing
            </p>
          )}
        </CardContent>
      </Card>

      {showQuoteForm && calculation && (
        <StoreQuoteRequestForm
          estimatedPrice={calculation.totalPrice}
          onSubmit={handleSubmitQuote}
          onCancel={() => setShowQuoteForm(false)}
        />
      )}
    </div>
  );
};
