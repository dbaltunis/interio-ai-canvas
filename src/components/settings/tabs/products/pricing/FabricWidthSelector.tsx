import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FabricWidthSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const FabricWidthSelector = ({ value, onChange }: FabricWidthSelectorProps) => {
  return (
    <Card className="p-3 bg-muted/30">
      <h5 className="font-medium text-sm mb-2">Fabric Width Configuration</h5>
      <div>
        <Label htmlFor="fabric_width_type">Standard Fabric Width</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select fabric width" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="narrow">Narrow Width (140cm) - More drops needed for wide curtains</SelectItem>
            <SelectItem value="wide">Wide Width (280cm) - Fewer drops needed</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          This determines how many fabric pieces (drops) are needed, which affects the total price
        </p>
      </div>
    </Card>
  );
};