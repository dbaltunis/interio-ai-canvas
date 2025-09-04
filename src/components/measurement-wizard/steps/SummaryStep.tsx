import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Save } from 'lucide-react';
import { useMeasurementWizardStore } from '@/stores/measurementWizardStore';

interface SummaryStepProps {
  onComplete: () => void;
}

export const SummaryStep: React.FC<SummaryStepProps> = ({ onComplete }) => {
  const {
    selectedTemplate,
    selectedFabric,
    measurements,
    priceBreakdown,
    priceTotal,
    isCalculating,
    calculatePricing,
    saveToJob
  } = useMeasurementWizardStore();

  useEffect(() => {
    if (selectedTemplate && !priceBreakdown) {
      calculatePricing();
    }
  }, [selectedTemplate, priceBreakdown, calculatePricing]);

  const handleSave = async () => {
    await saveToJob();
    onComplete();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Template</h4>
            <p className="text-sm text-muted-foreground">{selectedTemplate?.name}</p>
          </div>
          
          <div>
            <h4 className="font-medium">Main Fabric</h4>
            <p className="text-sm text-muted-foreground">{selectedFabric?.name || 'Not selected'}</p>
          </div>
          
          <div>
            <h4 className="font-medium">Key Measurements</h4>
            <div className="space-y-1">
              <p className="text-sm">Width: {measurements.rail_width || 0}mm</p>
              <p className="text-sm">Drop: {measurements.drop || 0}mm</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCalculating ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Calculating pricing...</p>
            </div>
          ) : priceBreakdown ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Materials</span>
                <span>${priceBreakdown.materials?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Labor</span>
                <span>${priceBreakdown.labor?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Markup</span>
                <span>${priceBreakdown.markup?.toFixed(2) || '0.00'}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>${priceTotal?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          ) : (
            <Button onClick={calculatePricing} className="w-full">
              Calculate Pricing
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={calculatePricing} variant="outline" className="flex-1">
          Recalculate
        </Button>
        <Button onClick={handleSave} className="flex-1 flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save to Job
        </Button>
      </div>
    </div>
  );
};