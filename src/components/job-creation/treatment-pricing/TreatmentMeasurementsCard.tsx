
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { TreatmentFormData } from "./useTreatmentFormData";

interface TreatmentMeasurementsCardProps {
  formData: TreatmentFormData;
  onInputChange: (field: string, value: any) => void;
}

export const TreatmentMeasurementsCard = ({ formData, onInputChange }: TreatmentMeasurementsCardProps) => {
  const { getLengthUnitLabel } = useMeasurementUnits();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Measurements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 items-center">
          <Label htmlFor="rail_width">Rail Width ({getLengthUnitLabel()})</Label>
          <Input
            id="rail_width"
            type="number"
            step="0.25"
            value={formData.rail_width}
            onChange={(e) => onInputChange("rail_width", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 items-center">
          <Label htmlFor="drop">Drop ({getLengthUnitLabel()})</Label>
          <Input
            id="drop"
            type="number"
            step="0.25"
            value={formData.drop}
            onChange={(e) => onInputChange("drop", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 items-center">
          <Label htmlFor="pooling">Pooling ({getLengthUnitLabel()})</Label>
          <Input
            id="pooling"
            type="number"
            step="0.25"
            value={formData.pooling}
            onChange={(e) => onInputChange("pooling", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 items-center">
          <Label htmlFor="heading_fullness">Heading Fullness</Label>
          <Input
            id="heading_fullness"
            type="number"
            step="0.1"
            min="1"
            max="5"
            value={formData.heading_fullness}
            onChange={(e) => onInputChange("heading_fullness", e.target.value)}
            placeholder="2.5"
          />
        </div>
        <p className="text-xs text-gray-500 col-span-2">
          Typical values: 2.0-2.5 for curtains, 1.5-2.0 for sheers
        </p>

        {/* Hem Allowances Section */}
        <div className="col-span-2 border-t pt-4 mt-4">
          <h4 className="font-medium text-sm mb-3">Hem Allowances ({getLengthUnitLabel()})</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="header_hem">Header Hem</Label>
              <Input
                id="header_hem"
                type="number"
                step="0.5"
                value={formData.header_hem || "15"}
                onChange={(e) => onInputChange("header_hem", e.target.value)}
                placeholder="15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bottom_hem">Bottom Hem</Label>
              <Input
                id="bottom_hem"
                type="number"
                step="0.5"
                value={formData.bottom_hem || "10"}
                onChange={(e) => onInputChange("bottom_hem", e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="side_hem">Side Hem (each side)</Label>
              <Input
                id="side_hem"
                type="number"
                step="0.5"
                value={formData.side_hem || "5"}
                onChange={(e) => onInputChange("side_hem", e.target.value)}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seam_hem">Seam Hem (per join)</Label>
              <Input
                id="seam_hem"
                type="number"
                step="0.5"
                value={formData.seam_hem || "3"}
                onChange={(e) => onInputChange("seam_hem", e.target.value)}
                placeholder="3"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Seam hems apply when multiple fabric widths need to be joined together
          </p>
        </div>

        {/* Custom Labor Rate Section */}
        <div className="col-span-2 border-t pt-4 mt-4">
          <h4 className="font-medium text-sm mb-3">Custom Sewing/Labor Rate</h4>
          <div className="grid grid-cols-2 gap-4 items-center">
            <Label htmlFor="custom_labor_rate">Override Labor Rate (per hour)</Label>
            <Input
              id="custom_labor_rate"
              type="number"
              step="0.50"
              value={formData.custom_labor_rate || ""}
              onChange={(e) => onInputChange("custom_labor_rate", e.target.value)}
              placeholder="Leave empty to use default"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Override the default labor rate for this specific treatment if different sewing complexity is required
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
