import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import type { CurtainTemplate } from "@/hooks/useCurtainTemplates";

interface LiningOptionsSectionProps {
  template: CurtainTemplate;
  selectedLining: string;
  onLiningChange: (liningType: string) => void;
  readOnly?: boolean;
}

export const LiningOptionsSection = ({
  template,
  selectedLining,
  onLiningChange,
  readOnly = false
}: LiningOptionsSectionProps) => {
  const { units } = useMeasurementUnits();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: units.currency
    }).format(price);
  };

  const getLiningBenefits = (liningType: string) => {
    switch(liningType) {
      case 'blackout':
        return ['Complete light blockage', 'Enhanced privacy', 'Thermal insulation'];
      case 'thermal':
        return ['Energy efficiency', 'Temperature regulation', 'Noise reduction'];
      case 'standard':
        return ['Protects main fabric', 'Improved draping', 'Professional finish'];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium mb-2 block text-card-foreground">Lining Options</Label>
        <Select 
          value={selectedLining} 
          onValueChange={onLiningChange}
          disabled={readOnly}
        >
          <SelectTrigger className="h-10 text-sm container-level-2 border-border">
            <SelectValue placeholder="Choose lining type" />
          </SelectTrigger>
          <SelectContent className="container-level-1 border-2 border-border z-[1000]">
            <SelectItem value="none" className="text-card-foreground">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium">No Lining</span>
                <span className="text-xs text-muted-foreground ml-2">Standard</span>
              </div>
            </SelectItem>
            {template.lining_types?.map((lining, index) => (
              <SelectItem key={index} value={lining.type} className="text-card-foreground">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">{lining.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  <span className="text-xs text-primary ml-2 font-semibold">
                    {formatPrice(lining.price_per_metre)}/m
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Compact lining info */}
      <div className="container-level-3 rounded-lg p-3">
        {selectedLining !== 'none' && template.lining_types?.find(l => l.type === selectedLining) && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="font-semibold text-card-foreground text-xs mb-1">Material Cost</div>
              <div className="text-primary font-bold text-sm">
                {formatPrice(template.lining_types.find(l => l.type === selectedLining)?.price_per_metre || 0)}/m
              </div>
            </div>
            <div>
              <div className="font-semibold text-card-foreground text-xs mb-1">Labor Cost</div>
              <div className="text-primary font-bold text-sm">
                {formatPrice(template.lining_types.find(l => l.type === selectedLining)?.labour_per_curtain || 0)}/curtain
              </div>
            </div>
          </div>
        )}
        {selectedLining !== 'none' && (
          <div>
            <div className="font-semibold text-card-foreground text-xs mb-2">Benefits</div>
            <div className="text-card-foreground text-sm">
              {getLiningBenefits(selectedLining).join(' • ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};