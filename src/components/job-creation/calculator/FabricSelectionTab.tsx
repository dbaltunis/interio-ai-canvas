
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { TreatmentFormData } from './types';
import { fabricLibrary } from './mockData';
import { formatCurrency } from './calculationUtils';

interface FabricSelectionTabProps {
  formData: TreatmentFormData;
  onInputChange: (field: string, value: any) => void;
}

export const FabricSelectionTab = ({ formData, onInputChange }: FabricSelectionTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <Button
          variant={formData.fabricMode === "library" ? "default" : "outline"}
          onClick={() => onInputChange("fabricMode", "library")}
          className="flex items-center"
        >
          <Package className="mr-2 h-4 w-4" />
          Select from Library
        </Button>
        <Button
          variant={formData.fabricMode === "manual" ? "default" : "outline"}
          onClick={() => onInputChange("fabricMode", "manual")}
        >
          Enter Manually
        </Button>
      </div>

      {formData.fabricMode === "library" ? (
        <div className="space-y-4">
          <Label className="text-base font-medium">Fabric Library</Label>
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {fabricLibrary.map((fabric) => (
              <Card 
                key={fabric.id} 
                className={`cursor-pointer transition-colors ${
                  formData.selectedFabric?.id === fabric.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onInputChange("selectedFabric", fabric)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{fabric.name}</h4>
                      <p className="text-sm text-muted-foreground">Code: {fabric.code}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{fabric.type}</Badge>
                        <Badge variant="outline">{fabric.collection}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(fabric.pricePerYard)}/yard</p>
                      <p className="text-sm text-muted-foreground">{fabric.width}cm width</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Label className="text-base font-medium">Manual Fabric Entry</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fabricName">Fabric Name</Label>
              <Input
                id="fabricName"
                value={formData.fabricName}
                onChange={(e) => onInputChange("fabricName", e.target.value)}
                placeholder="Enter fabric name"
              />
            </div>
            <div>
              <Label htmlFor="fabricPricePerYard">Price per Yard</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="fabricPricePerYard"
                  type="number"
                  step="0.01"
                  value={formData.fabricPricePerYard}
                  onChange={(e) => onInputChange("fabricPricePerYard", e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fabricWidth">Fabric Width (cm)</Label>
              <Input
                id="fabricWidth"
                type="number"
                value={formData.fabricWidth}
                onChange={(e) => onInputChange("fabricWidth", e.target.value)}
                placeholder="140"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="verticalRepeat">Vertical Repeat (cm)</Label>
              <Input
                id="verticalRepeat"
                type="number"
                value={formData.verticalRepeat}
                onChange={(e) => onInputChange("verticalRepeat", e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="horizontalRepeat">Horizontal Repeat (cm)</Label>
              <Input
                id="horizontalRepeat"
                type="number"
                value={formData.horizontalRepeat}
                onChange={(e) => onInputChange("horizontalRepeat", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
