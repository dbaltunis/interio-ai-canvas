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
  const isCurtain = formData.curtain_type === 'curtain';
  
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {isCurtain && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="header_allowance">Header</Label>
              <Input
                id="header_allowance"
                type="number"
                step="0.5"
                value={formData.header_allowance}
                onChange={(e) => handleInputChange("header_allowance", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bottom_hem">Bottom</Label>
              <Input
                id="bottom_hem"
                type="number"
                step="0.5"
                value={formData.bottom_hem}
                onChange={(e) => handleInputChange("bottom_hem", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="side_hems">Sides</Label>
              <Input
                id="side_hems"
                type="number"
                step="0.5"
                value={formData.side_hems}
                onChange={(e) => handleInputChange("side_hems", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="waste_percent">Waste %</Label>
              <Input
                id="waste_percent"
                type="number"
                step="0.1"
                value={formData.waste_percent}
                onChange={(e) => handleInputChange("waste_percent", e.target.value)}
              />
            </div>
          </div>
        )}
        
        {!isCurtain && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="minimum_width">Min Width</Label>
              <Input
                id="minimum_width"
                type="number"
                value={formData.minimum_width}
                onChange={(e) => handleInputChange("minimum_width", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maximum_width">Max Width</Label>
              <Input
                id="maximum_width"
                type="number"
                value={formData.maximum_width}
                onChange={(e) => handleInputChange("maximum_width", e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
