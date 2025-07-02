import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RotateCw, TrendingDown, Info } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { TreatmentFormData } from "./useTreatmentFormData";

interface FabricDetailsCardProps {
  formData: TreatmentFormData;
  onInputChange: (field: string, value: any) => void;
  fabricUsage: string;
  costs?: {
    fabricOrientation?: string;
    costComparison?: any;
    warnings?: string[];
    seamsRequired?: number;
    seamLaborHours?: number;
    widthsRequired?: number;
  };
}

export const FabricDetailsCard = ({ formData, onInputChange, fabricUsage, costs }: FabricDetailsCardProps) => {
  const { units, getLengthUnitLabel, getFabricUnitLabel } = useMeasurementUnits();

  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;

  // Determine if the current orientation is auto-selected
  const fabricWidthCm = parseFloat(formData.fabric_width) || 137;
  const fabricWidthInches = Math.round(fabricWidthCm / 2.54);
  const autoSelectedOrientation = fabricWidthCm <= 200 ? "vertical" : "horizontal";
  const isAutoSelected = formData.roll_direction === autoSelectedOrientation;

  // Dynamic labeling based on recommendation
  const isNarrowFabric = fabricWidthCm <= 200;
  const horizontalLabel = isNarrowFabric ? "Horizontal (Rotated)" : "Horizontal (Standard)";
  const verticalLabel = isNarrowFabric ? "Vertical (Standard)" : "Vertical (Rotated)";

  // Get fabric usage in correct units
  const displayFabricUsage = units.fabric === 'yards' ? fabricUsage : 
    costs?.fabricOrientation ? (parseFloat(fabricUsage) * 1.094).toFixed(1) : fabricUsage;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fabric Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fabric_type">Fabric Type</Label>
            <Input
              id="fabric_type"
              value={formData.fabric_type}
              onChange={(e) => onInputChange("fabric_type", e.target.value)}
              placeholder="e.g., Cotton, Linen, Silk"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fabric_code">Fabric Code</Label>
            <Input
              id="fabric_code"
              value={formData.fabric_code}
              onChange={(e) => onInputChange("fabric_code", e.target.value)}
              placeholder="Fabric reference code"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fabric_width">Fabric Width ({getLengthUnitLabel()})</Label>
            <Input
              id="fabric_width"
              type="number"
              step="0.5"
              value={formData.fabric_width}
              onChange={(e) => onInputChange("fabric_width", e.target.value)}
              placeholder="137"
            />
            <div className="text-xs text-muted-foreground">
              {fabricWidthCm}cm = {fabricWidthInches}" 
              {fabricWidthCm <= 200 ? " (Narrow fabric)" : " (Wide fabric)"}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="roll_direction">Roll Direction</Label>
            <Select value={formData.roll_direction} onValueChange={(value) => onInputChange("roll_direction", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select roll direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">
                  <div className="flex items-center gap-2">
                    {horizontalLabel}
                    {!isNarrowFabric && <Badge variant="secondary" className="text-xs">Recommended</Badge>}
                  </div>
                </SelectItem>
                <SelectItem value="vertical">
                  <div className="flex items-center gap-2">
                    {verticalLabel}
                    {isNarrowFabric && <Badge variant="secondary" className="text-xs">Recommended</Badge>}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {isAutoSelected && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Info className="w-3 h-3" />
                Auto-selected for {fabricWidthCm <= 200 ? "narrow" : "wide"} fabric
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fabric_cost_per_yard">Cost per {getFabricUnitLabel()} ({units.currency})</Label>
          <Input
            id="fabric_cost_per_yard"
            type="number"
            step="0.01"
            value={formData.fabric_cost_per_yard}
            onChange={(e) => onInputChange("fabric_cost_per_yard", e.target.value)}
            placeholder="0.00"
          />
        </div>

        {/* Fabric Width Guidelines */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="text-sm">
              <strong>Fabric Width Guidelines:</strong>
              <div className="mt-1 space-y-1">
                <div>• <strong>Narrow fabrics (≤200cm/79"):</strong> Default to vertical orientation for better fabric utilization</div>
                <div>• <strong>Wide fabrics ({">"}200cm/79"):</strong> Default to horizontal orientation for standard curtain making</div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Fabric Usage Display */}
        {fabricUsage !== "0.0" && (
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-blue-800">
                  Estimated fabric usage: {displayFabricUsage} {getFabricUnitLabel()}
                </div>
                {costs?.fabricOrientation && (
                  <Badge variant={costs.fabricOrientation === 'vertical' ? 'default' : 'secondary'}>
                    <RotateCw className="w-3 h-3 mr-1" />
                    {costs.fabricOrientation}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-blue-600">
                Based on {formData.fabric_width}{getLengthUnitLabel()} fabric width, {formData.roll_direction} roll direction, {formData.heading_fullness}x fullness
              </div>
              
              {/* Seam Information */}
              {costs?.seamsRequired && costs.seamsRequired > 0 && (
                <div className="mt-2 p-2 bg-blue-100 rounded">
                  <div className="text-xs text-blue-700">
                    <strong>Seaming required:</strong> {costs.seamsRequired} seam(s), {costs.widthsRequired} fabric width(s)
                  </div>
                  <div className="text-xs text-blue-600">
                    Additional {costs.seamLaborHours?.toFixed(1)}h labor for seaming
                  </div>
                </div>
              )}
            </div>

            {/* Cost Comparison */}
            {costs?.costComparison && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingDown className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Cost Optimization Available</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">Horizontal Orientation</div>
                    <div>Fabric: {costs.costComparison.horizontal.totalYards.toFixed(1)} yards</div>
                    <div>Cost: {formatCurrency(costs.costComparison.horizontal.totalCost)}</div>
                    <div>Seams: {costs.costComparison.horizontal.seamsRequired}</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium">Vertical Orientation</div>
                    <div>Fabric: {costs.costComparison.vertical.totalYards.toFixed(1)} yards</div>
                    <div>Cost: {formatCurrency(costs.costComparison.vertical.totalCost)}</div>
                    <div>Seams: {costs.costComparison.vertical.seamsRequired}</div>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-green-100 rounded">
                  <div className="text-xs text-green-700">
                    <strong>Recommended:</strong> {costs.costComparison.recommendation} orientation
                  </div>
                  <div className="text-xs text-green-600">
                    Potential savings: {formatCurrency(costs.costComparison.savings)}
                  </div>
                </div>
              </div>
            )}

            {/* Warnings */}
            {costs?.warnings && costs.warnings.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {costs.warnings.map((warning, index) => (
                      <div key={index} className="text-xs">{warning}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
