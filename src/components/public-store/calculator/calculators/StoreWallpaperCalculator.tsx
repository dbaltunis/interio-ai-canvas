import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator, Send } from "lucide-react";
import { formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { StoreQuoteRequestForm } from "../StoreQuoteRequestForm";
import { calculateWallpaperCost } from "@/utils/wallpaperCalculations";

interface StoreWallpaperCalculatorProps {
  product: any;
  storeData: any;
  onSubmitQuote: (quoteData: any) => void;
  onAddToCart?: (configuration: Record<string, any>, estimatedPrice: number) => void;
}

export const StoreWallpaperCalculator = ({ product, storeData, onSubmitQuote, onAddToCart }: StoreWallpaperCalculatorProps) => {
  const [measurements, setMeasurements] = useState({
    width: "",
    height: "",
  });
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [calculation, setCalculation] = useState<any>(null);

  const handleCalculate = () => {
    const width = parseFloat(measurements.width);
    const height = parseFloat(measurements.height);

    if (isNaN(width) || isNaN(height) || !product.inventory_item) {
      return;
    }

    const result = calculateWallpaperCost(width, height, product.inventory_item);
    setCalculation(result);
    setShowQuoteForm(true);
  };

  const handleSubmitQuote = (customerInfo: any) => {
    onSubmitQuote({
      ...customerInfo,
      configuration_data: {
        measurements,
        product_name: product.inventory_item?.name,
        product_category: product.inventory_item?.category,
        calculation,
      },
      quote_data: {
        estimated_price: calculation?.totalCost || 0,
        currency: 'NZD',
        calculation_details: calculation,
      },
    });
    setShowQuoteForm(false);
    setMeasurements({ width: "", height: "" });
    setCalculation(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Wallpaper Calculator
          </CardTitle>
          <CardDescription>
            Calculate how much wallpaper you'll need
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Wall Width (cm)</Label>
              <Input
                id="width"
                type="number"
                placeholder="300"
                value={measurements.width}
                onChange={(e) => setMeasurements({ ...measurements, width: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="height">Wall Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="250"
                value={measurements.height}
                onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
              />
            </div>
          </div>

          {calculation && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">Calculation Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Strips Needed:</span>
                      <span className="font-medium">{calculation.stripsNeeded}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rolls Needed:</span>
                      <span className="font-medium">{calculation.rollsNeeded}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Meters:</span>
                      <span className="font-medium">{calculation.totalMeters.toFixed(2)}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{calculation.quantity.toFixed(2)} {calculation.unitLabel}</span>
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
                    Based on {calculation.quantity.toFixed(2)} {calculation.unitLabel} @ {formatCurrency(calculation.pricePerUnit, 'NZD')} per {calculation.unitLabel}
                  </p>
                </div>
              </div>
            </>
          )}

          <Button
            onClick={handleCalculate}
            className="w-full"
            size="lg"
            style={{ backgroundColor: 'var(--store-primary)' }}
          >
            {calculation ? 'Recalculate' : 'Calculate'}
          </Button>

          {calculation && !showQuoteForm && (
            <div className="space-y-2">
              {onAddToCart && (
                <Button
                  onClick={() => {
                    onAddToCart(
                      {
                        measurements,
                        product_name: product.inventory_item?.name,
                        calculation,
                      },
                      calculation.totalCost
                    );
                  }}
                  className="w-full"
                  size="lg"
                  style={{ backgroundColor: 'var(--store-primary)' }}
                >
                  Add to Cart
                </Button>
              )}
              <Button
                onClick={() => setShowQuoteForm(true)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Send className="mr-2 h-4 w-4" />
                Request Detailed Quote
              </Button>
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
