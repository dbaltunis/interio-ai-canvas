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
      <div className="space-y-3">
        <div>
          <Label htmlFor="fabric_width_type">Standard Fabric Width</Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select fabric width" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="narrow">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">Standard/Narrow Width (140-150cm)</span>
                  <span className="text-xs text-muted-foreground">Pattern runs vertically - requires seams for wide curtains</span>
                </div>
              </SelectItem>
              <SelectItem value="wide">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">Railroaded/Wide Width (280cm+)</span>
                  <span className="text-xs text-muted-foreground">Pattern runs horizontally - no vertical seams needed</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-2 p-2 bg-background/50 rounded border border-border/50">
          <p className="font-medium text-foreground">Understanding Fabric Orientation:</p>
          <div>
            <span className="font-medium">• Standard Fabric:</span> Pattern runs along the length (vertically). Multiple drops sewn together with seams for wide curtains.
          </div>
          <div>
            <span className="font-medium">• Railroaded Fabric:</span> Pattern runs across the width (horizontally). Can make wide curtains without vertical seams.
          </div>
        </div>
      </div>
    </Card>
  );
};