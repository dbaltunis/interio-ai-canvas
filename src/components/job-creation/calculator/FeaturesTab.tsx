
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, X } from "lucide-react";
import { TreatmentFormData, AdditionalFeature } from './types';
import { availableFeatures } from './mockData';
import { formatCurrency } from './calculationUtils';

interface FeaturesTabProps {
  formData: TreatmentFormData;
  onInputChange: (field: string, value: any) => void;
}

export const FeaturesTab = ({ formData, onInputChange }: FeaturesTabProps) => {
  const handleFeatureToggle = (featureId: string) => {
    onInputChange("additionalFeatures", formData.additionalFeatures.map(feature =>
      feature.id === featureId ? { ...feature, selected: !feature.selected } : feature
    ));
  };

  const addFeature = (feature: AdditionalFeature) => {
    onInputChange("additionalFeatures", [...formData.additionalFeatures, { ...feature, selected: true }]);
  };

  const removeFeature = (featureId: string) => {
    onInputChange("additionalFeatures", formData.additionalFeatures.filter(f => f.id !== featureId));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Hardware Selection</Label>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <Label>Hardware Type</Label>
            <Select value={formData.hardware} onValueChange={(value) => onInputChange("hardware", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select hardware" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="curtain-pole">Curtain Pole</SelectItem>
                <SelectItem value="curtain-track">Curtain Track</SelectItem>
                <SelectItem value="bay-track">Bay Track</SelectItem>
                <SelectItem value="motorized">Motorized Track</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Finish</Label>
            <Select value={formData.hardwareFinish} onValueChange={(value) => onInputChange("hardwareFinish", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select finish" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chrome">Chrome</SelectItem>
                <SelectItem value="brass">Brass</SelectItem>
                <SelectItem value="black">Black</SelectItem>
                <SelectItem value="white">White</SelectItem>
                <SelectItem value="wood">Wood</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex justify-between items-center mb-3">
          <Label className="text-base font-medium">Additional Features</Label>
          <p className="text-sm text-muted-foreground">
            Selected: {formData.additionalFeatures.filter(f => f.selected).length}
          </p>
        </div>
        
        <div className="grid gap-3 max-h-64 overflow-y-auto">
          {availableFeatures.map((feature) => {
            const isAdded = formData.additionalFeatures.some(f => f.id === feature.id);
            const addedFeature = formData.additionalFeatures.find(f => f.id === feature.id);
            
            return (
              <Card key={feature.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{feature.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Additional cost: {formatCurrency(feature.price)}
                      </p>
                    </div>
                    {isAdded ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={addedFeature?.selected || false}
                          onChange={() => handleFeatureToggle(feature.id)}
                          className="rounded"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFeature(feature.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addFeature(feature)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-base font-medium">Pricing Settings</Label>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <Label htmlFor="laborRate">Labor Rate ($/hour)</Label>
            <Input
              id="laborRate"
              type="number"
              value={formData.laborRate}
              onChange={(e) => onInputChange("laborRate", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="markupPercentage">Markup Percentage (%)</Label>
            <Input
              id="markupPercentage"
              type="number"
              value={formData.markupPercentage}
              onChange={(e) => onInputChange("markupPercentage", parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
