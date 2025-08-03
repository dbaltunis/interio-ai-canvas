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
    <div className="space-y-2">
      <div>
        <Label className="text-xs font-medium mb-1 block text-gray-700">Lining Options</Label>
        <Select 
          value={selectedLining} 
          onValueChange={onLiningChange}
          disabled={readOnly}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Choose lining type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">No Lining</span>
                <span className="text-xs text-muted-foreground ml-2">Standard</span>
              </div>
            </SelectItem>
            {template.lining_types?.map((lining, index) => (
              <SelectItem key={index} value={lining.type}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">{lining.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatPrice(lining.price_per_metre)}/m
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Compact lining info */}
      <div className="grid grid-cols-2 gap-1 p-2 bg-gray-50 rounded text-xs">
        {selectedLining !== 'none' && template.lining_types?.find(l => l.type === selectedLining) && (
          <>
            <div>
              <div className="font-medium text-gray-600 text-xs">Material Cost</div>
              <div className="text-gray-800 text-xs">
                {formatPrice(template.lining_types.find(l => l.type === selectedLining)?.price_per_metre || 0)}/m
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-600 text-xs">Labor Cost</div>
              <div className="text-gray-800 text-xs">
                {formatPrice(template.lining_types.find(l => l.type === selectedLining)?.labour_per_curtain || 0)}/curtain
              </div>
            </div>
          </>
        )}
        {selectedLining !== 'none' && (
          <div className="col-span-2">
            <div className="font-medium text-gray-600 text-xs mb-1">Benefits</div>
            <div className="text-gray-800 text-xs">
              {getLiningBenefits(selectedLining).join(' • ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};