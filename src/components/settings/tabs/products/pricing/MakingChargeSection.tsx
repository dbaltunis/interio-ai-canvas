import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getCurrencySymbol } from "@/utils/formatCurrency";

interface MakingChargeSectionProps {
  makingChargePerMeter: string;
  makingChargeMethod: string;
  headingMakingCharges: Record<string, number>;
  selectedHeadingIds: string[];
  headings: Array<{ id: string; name: string }>;
  onInputChange: (field: string, value: any) => void;
}

export const MakingChargeSection = ({
  makingChargePerMeter,
  makingChargeMethod,
  headingMakingCharges,
  selectedHeadingIds,
  headings,
  onInputChange,
}: MakingChargeSectionProps) => {
  const [showHeadingOverrides, setShowHeadingOverrides] = useState(
    Object.keys(headingMakingCharges || {}).length > 0
  );
  const { units } = useMeasurementUnits();
  const currencySymbol = getCurrencySymbol(units.currency || 'USD');
  const lengthLabel = units.length === 'inches' || units.length === 'feet' ? 'yard' : 'meter';

  // Get headings that are selected in the template
  const selectedHeadings = headings.filter(h => selectedHeadingIds.includes(h.id));

  const handleHeadingPriceChange = (headingId: string, value: string) => {
    const newCharges = { ...headingMakingCharges };
    if (value && parseFloat(value) > 0) {
      newCharges[headingId] = parseFloat(value);
    } else {
      delete newCharges[headingId];
    }
    onInputChange("heading_making_charges", newCharges);
  };

  const getMethodLabel = () => {
    switch (makingChargeMethod) {
      case 'per_meter': return `${currencySymbol}/${lengthLabel}`;
      case 'per_panel': return `${currencySymbol}/panel`;
      case 'per_unit': return `${currencySymbol}/unit`;
      default: return `${currencySymbol}/${lengthLabel}`;
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Scissors className="h-4 w-4 text-primary" />
          Making / Stitching Charge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Price Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Base Price</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={makingChargePerMeter}
              onChange={(e) => onInputChange("making_charge_per_meter", e.target.value)}
            />
          </div>
          <div>
            <Label>Method</Label>
            <Select
              value={makingChargeMethod}
              onValueChange={(value) => onInputChange("making_charge_method", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_meter">Per Running {lengthLabel.charAt(0).toUpperCase() + lengthLabel.slice(1)}</SelectItem>
                <SelectItem value="per_panel">Per Panel</SelectItem>
                <SelectItem value="per_unit">Per Unit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Heading-specific overrides toggle */}
        {selectedHeadings.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="heading-overrides"
                  checked={showHeadingOverrides}
                  onCheckedChange={setShowHeadingOverrides}
                />
                <Label htmlFor="heading-overrides" className="cursor-pointer text-sm">
                  Different prices by heading
                </Label>
              </div>
              {showHeadingOverrides && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowHeadingOverrides(!showHeadingOverrides)}
                >
                  {showHeadingOverrides ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>

            {showHeadingOverrides && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                <p className="text-xs text-muted-foreground">
                  Override base price for specific headings (blank = use base price)
                </p>
                <div className="grid gap-2">
                  {selectedHeadings.map((heading) => (
                    <div key={heading.id} className="flex items-center gap-3">
                      <span className="text-sm min-w-[120px] truncate">{heading.name}</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={makingChargePerMeter || "Base price"}
                        className="w-24"
                        value={headingMakingCharges?.[heading.id] || ""}
                        onChange={(e) => handleHeadingPriceChange(heading.id, e.target.value)}
                      />
                      <span className="text-xs text-muted-foreground">{getMethodLabel()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedHeadings.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Select headings in the Heading tab to enable heading-specific pricing
          </p>
        )}
      </CardContent>
    </Card>
  );
};
