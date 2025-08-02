import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lining Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup 
          value={selectedLining} 
          onValueChange={onLiningChange}
          disabled={readOnly}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="no-lining" />
            <Label htmlFor="no-lining" className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <span>No Lining</span>
                <Badge variant="outline">Standard</Badge>
              </div>
            </Label>
          </div>
          
          {template.lining_types.map((lining, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={lining.type} id={`lining-${index}`} />
              <Label htmlFor={`lining-${index}`} className="flex-1 cursor-pointer">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{lining.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <Badge variant="secondary">{formatPrice(lining.price_per_metre)}/m</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Labor: {formatPrice(lining.labour_per_curtain)}/curtain
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {selectedLining !== 'none' && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <div className="font-medium mb-2">Selected Lining Benefits</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                {selectedLining === 'blackout' && (
                  <>
                    <li>• Complete light blockage</li>
                    <li>• Enhanced privacy</li>
                    <li>• Thermal insulation</li>
                  </>
                )}
                {selectedLining === 'thermal' && (
                  <>
                    <li>• Energy efficiency</li>
                    <li>• Temperature regulation</li>
                    <li>• Noise reduction</li>
                  </>
                )}
                {selectedLining === 'standard' && (
                  <>
                    <li>• Protects main fabric</li>
                    <li>• Improved draping</li>
                    <li>• Professional finish</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};