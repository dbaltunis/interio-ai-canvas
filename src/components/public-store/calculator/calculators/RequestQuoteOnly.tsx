import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Send, Calendar } from "lucide-react";
import { StoreQuoteRequestForm } from "../StoreQuoteRequestForm";

interface RequestQuoteOnlyProps {
  product: any;
  storeData: any;
  onSubmitQuote: (quoteData: any) => void;
}

export const RequestQuoteOnly = ({ product, storeData, onSubmitQuote }: RequestQuoteOnlyProps) => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [measurements, setMeasurements] = useState({
    width: "",
    height: "",
    notes: "",
  });

  const handleSubmitQuote = (customerInfo: any) => {
    onSubmitQuote({
      ...customerInfo,
      configuration_data: {
        measurements,
        product_name: product.inventory_item?.name,
        product_category: product.inventory_item?.category,
        requires_consultation: true,
      },
      quote_data: {
        estimated_price: 0,
        currency: 'NZD',
        requires_site_visit: true,
      },
    });
    setShowQuoteForm(false);
    setMeasurements({ width: "", height: "", notes: "" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Quote Required</CardTitle>
          <CardDescription>
            This product requires personalized consultation for accurate pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Due to the custom nature of this product, we recommend a free consultation
              to discuss your specific requirements and provide accurate pricing.
            </AlertDescription>
          </Alert>

          {/* Product Information */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Product Details</h4>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium">{product.inventory_item?.name}</span>
              </div>
              {product.inventory_item?.category && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium capitalize">
                    {product.inventory_item.category.replace('_', ' ')}
                  </span>
                </div>
              )}
              {product.inventory_item?.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {product.inventory_item.description}
                </p>
              )}
            </div>
          </div>

          {/* Why Quote Required */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Why is a consultation needed?</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Complex measurements and site requirements</li>
              <li>Multiple configuration options available</li>
              <li>Installation considerations need assessment</li>
              <li>Custom specifications may apply</li>
            </ul>
          </div>

          {/* Optional Measurements */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Optional: Share Your Measurements</h4>
            <p className="text-xs text-muted-foreground">
              Help us prepare for your consultation by providing approximate measurements
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="e.g., 150"
                  value={measurements.width}
                  onChange={(e) => setMeasurements({ ...measurements, width: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="e.g., 220"
                  value={measurements.height}
                  onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any specific requirements or questions..."
                rows={3}
                value={measurements.notes}
                onChange={(e) => setMeasurements({ ...measurements, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => setShowQuoteForm(true)}
              className="w-full"
              size="lg"
              style={{ backgroundColor: 'var(--store-primary)' }}
            >
              <Send className="mr-2 h-4 w-4" />
              Request Custom Quote
            </Button>
            
            {storeData.booking_enabled && (
              <Button
                onClick={() => window.location.href = `/store/${storeData.store_slug}/book`}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Free Consultation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showQuoteForm && (
        <StoreQuoteRequestForm
          estimatedPrice={0}
          onSubmit={handleSubmitQuote}
          onCancel={() => setShowQuoteForm(false)}
        />
      )}
    </div>
  );
};
