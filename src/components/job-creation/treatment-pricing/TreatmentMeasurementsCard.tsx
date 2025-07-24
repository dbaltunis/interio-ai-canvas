
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ruler } from "lucide-react";

interface TreatmentMeasurementsCardProps {
  formData: {
    rail_width: string;
    drop: string;
    pooling: string;
    quantity: number;
  };
  onInputChange: (field: string, value: any) => void;
}

export const TreatmentMeasurementsCard = ({ 
  formData, 
  onInputChange 
}: TreatmentMeasurementsCardProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="rail_width">Rail Width (inches)</Label>
          <Input
            id="rail_width"
            type="number"
            step="0.1"
            value={formData.rail_width}
            onChange={(e) => onInputChange("rail_width", e.target.value)}
            placeholder="e.g., 48"
          />
        </div>
        <div>
          <Label htmlFor="drop">Drop (inches)</Label>
          <Input
            id="drop"
            type="number"
            step="0.1"
            value={formData.drop}
            onChange={(e) => onInputChange("drop", e.target.value)}
            placeholder="e.g., 84"
          />
        </div>
        <div>
          <Label htmlFor="pooling">Pooling (inches)</Label>
          <Input
            id="pooling"
            type="number"
            step="0.1"
            value={formData.pooling}
            onChange={(e) => onInputChange("pooling", e.target.value)}
            placeholder="e.g., 0"
          />
        </div>
      </div>
    </div>
  );
};
