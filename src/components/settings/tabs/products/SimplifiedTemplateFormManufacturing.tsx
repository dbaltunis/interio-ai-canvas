import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SimplifiedTemplateFormManufacturingProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export const SimplifiedTemplateFormManufacturing = ({ 
  formData, 
  handleInputChange 
}: SimplifiedTemplateFormManufacturingProps) => {
  const treatmentCategory = formData.treatment_category || formData.curtain_type;
  const isCurtain = treatmentCategory === 'curtains' || treatmentCategory === 'curtain';
  const isRoman = treatmentCategory === 'roman_blinds' || treatmentCategory === 'roman_blind';
  
  // Only show manufacturing for curtains/romans - not for blinds
  if (!isCurtain && !isRoman) {
    return null;
  }
  
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Header</Label>
            <Input
              type="number"
              step="0.5"
              value={formData.header_allowance}
              onChange={(e) => handleInputChange("header_allowance", e.target.value)}
            />
          </div>
          <div>
            <Label>Bottom</Label>
            <Input
              type="number"
              step="0.5"
              value={formData.bottom_hem}
              onChange={(e) => handleInputChange("bottom_hem", e.target.value)}
            />
          </div>
          <div>
            <Label>Sides</Label>
            <Input
              type="number"
              step="0.5"
              value={formData.side_hems}
              onChange={(e) => handleInputChange("side_hems", e.target.value)}
            />
          </div>
          <div>
            <Label>Seams</Label>
            <Input
              type="number"
              step="0.5"
              value={formData.seam_hems}
              onChange={(e) => handleInputChange("seam_hems", e.target.value)}
            />
          </div>
          <div>
            <Label>Left Return</Label>
            <Input
              type="number"
              step="0.5"
              value={formData.return_left}
              onChange={(e) => handleInputChange("return_left", e.target.value)}
            />
          </div>
          <div>
            <Label>Right Return</Label>
            <Input
              type="number"
              step="0.5"
              value={formData.return_right}
              onChange={(e) => handleInputChange("return_right", e.target.value)}
            />
          </div>
          <div>
            <Label>Overlap</Label>
            <Input
              type="number"
              step="0.5"
              value={formData.overlap}
              onChange={(e) => handleInputChange("overlap", e.target.value)}
            />
          </div>
          <div>
            <Label>Waste %</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.waste_percent}
              onChange={(e) => handleInputChange("waste_percent", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
