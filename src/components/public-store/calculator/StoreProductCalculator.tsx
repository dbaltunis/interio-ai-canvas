import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator, Send } from "lucide-react";
import { formatCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { StoreQuoteRequestForm } from "./StoreQuoteRequestForm";

interface StoreProductCalculatorProps {
  product: any;
  storeData: any;
  onSubmitQuote: (quoteData: any) => void;
}

export const StoreProductCalculator = ({ product, storeData, onSubmitQuote }: StoreProductCalculatorProps) => {
  const [measurements, setMeasurements] = useState({
    width: "",
    height: "",
    quantity: "1",
  });
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  // Simple calculation - in production, this would use the actual pricing logic
  const calculatePrice = () => {
    const width = parseFloat(measurements.width);
    const height = parseFloat(measurements.height);
    const quantity = parseInt(measurements.quantity);

    if (isNaN(width) || isNaN(height) || isNaN(quantity)) {
      return null;
    }

    // Base calculation: area * base price * quantity
    // This is simplified - actual calculation would use fabric calculator
    const basePrice = product.inventory_item?.unit_price || 100;
    const area = (width / 100) * (height / 100); // Convert cm to m
    const price = area * basePrice * quantity;

    return Math.max(price, 50); // Minimum price
  };

  const handleCalculate = () => {
    const price = calculatePrice();
    setCalculatedPrice(price);
    if (price) {
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
      },
      quote_data: {
        estimated_price: calculatedPrice,
        currency: 'NZD',
      },
    });
    setShowQuoteForm(false);
    setMeasurements({ width: "", height: "", quantity: "1" });
    setCalculatedPrice(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Get Instant Quote
          </CardTitle>
          <CardDescription>
            Enter your measurements to calculate pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Width (cm)</Label>
              <Input
                id="width"
                type="number"
                placeholder="150"
                value={measurements.width}
                onChange={(e) => setMeasurements({ ...measurements, width: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="200"
                value={measurements.height}
                onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={measurements.quantity}
              onChange={(e) => setMeasurements({ ...measurements, quantity: e.target.value })}
            />
          </div>

          {calculatedPrice && (
            <>
              <Separator />
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estimated Price:</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--store-primary)' }}>
                    {formatCurrency(calculatedPrice, 'NZD')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Final price may vary based on specific requirements and options selected
                </p>
              </div>
            </>
          )}

          <Button
            onClick={handleCalculate}
            className="w-full"
            size="lg"
            style={{ backgroundColor: 'var(--store-primary)' }}
          >
            {calculatedPrice ? 'Recalculate' : 'Calculate Price'}
          </Button>

          {calculatedPrice && !showQuoteForm && (
            <Button
              onClick={() => setShowQuoteForm(true)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Send className="mr-2 h-4 w-4" />
              Request Detailed Quote
            </Button>
          )}
        </CardContent>
      </Card>

      {showQuoteForm && calculatedPrice && (
        <StoreQuoteRequestForm
          estimatedPrice={calculatedPrice}
          onSubmit={handleSubmitQuote}
          onCancel={() => setShowQuoteForm(false)}
        />
      )}
    </div>
  );
};
