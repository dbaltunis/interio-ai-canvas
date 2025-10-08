import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEnhancedInventoryByCategory } from "@/hooks/useEnhancedInventory";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

interface DynamicRollerBlindFieldsProps {
  measurements: Record<string, any>;
  onChange: (field: string, value: string) => void;
  treatmentType: string;
  readOnly?: boolean;
}

export const DynamicRollerBlindFields = ({ 
  measurements, 
  onChange, 
  treatmentType,
  readOnly = false 
}: DynamicRollerBlindFieldsProps) => {
  const { data: blindOptions = [], isLoading } = useEnhancedInventoryByCategory('blind_option');
  
  // Extract options from configured blind_option items
  const getOptionsByType = (optionType: string) => {
    return blindOptions
      .filter(opt => {
        try {
          const details = JSON.parse(opt.description || '{}');
          return details.option_type === optionType && 
                 (!opt.treatment_type || opt.treatment_type === treatmentType);
        } catch {
          return false;
        }
      })
      .map(opt => {
        const details = JSON.parse(opt.description || '{}');
        return {
          value: details.option_value,
          label: opt.name,
          price: opt.price_per_meter || 0
        };
      });
  };

  const tubeSizes = useMemo(() => getOptionsByType('tube_size'), [blindOptions, treatmentType]);
  const mountTypes = useMemo(() => getOptionsByType('mount_type'), [blindOptions, treatmentType]);
  const fasciaTypes = useMemo(() => getOptionsByType('fascia_type'), [blindOptions, treatmentType]);
  const bottomRailStyles = useMemo(() => getOptionsByType('bottom_rail_style'), [blindOptions, treatmentType]);
  const controlTypes = useMemo(() => getOptionsByType('control_type'), [blindOptions, treatmentType]);
  const chainSides = useMemo(() => getOptionsByType('chain_side'), [blindOptions, treatmentType]);
  const motorTypes = useMemo(() => getOptionsByType('motor_type'), [blindOptions, treatmentType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (blindOptions.length === 0) {
    return (
      <div className="p-4 border border-amber-300 bg-amber-50 rounded-lg">
        <p className="text-sm text-amber-800 font-medium">
          No roller blind options configured
        </p>
        <p className="text-xs text-amber-700 mt-1">
          Please add roller blind options in Settings → Window Coverings → Roller Blind Options
        </p>
      </div>
    );
  }

  const formatLabel = (value: string) => {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-4">
      {/* Tube Size */}
      {tubeSizes.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="tube_size">Tube Size</Label>
          <Select 
            value={measurements.tube_size || tubeSizes[0]?.value} 
            onValueChange={(value) => onChange('tube_size', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="tube_size">
              <SelectValue placeholder="Select tube size" />
            </SelectTrigger>
            <SelectContent>
              {tubeSizes.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} {opt.price > 0 && `(+$${opt.price.toFixed(2)})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Mount Type */}
      {mountTypes.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="mount_type">Mount Type</Label>
          <Select 
            value={measurements.mount_type || mountTypes[0]?.value} 
            onValueChange={(value) => onChange('mount_type', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="mount_type">
              <SelectValue placeholder="Select mount type" />
            </SelectTrigger>
            <SelectContent>
              {mountTypes.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} {opt.price > 0 && `(+$${opt.price.toFixed(2)})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Fascia Type */}
      {fasciaTypes.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="fascia_type">Fascia/Cassette Type</Label>
          <Select 
            value={measurements.fascia_type || fasciaTypes[0]?.value} 
            onValueChange={(value) => onChange('fascia_type', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="fascia_type">
              <SelectValue placeholder="Select fascia type" />
            </SelectTrigger>
            <SelectContent>
              {fasciaTypes.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} {opt.price > 0 && `(+$${opt.price.toFixed(2)})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Bottom Rail Style */}
      {bottomRailStyles.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="bottom_rail_style">Bottom Rail Style</Label>
          <Select 
            value={measurements.bottom_rail_style || bottomRailStyles[0]?.value} 
            onValueChange={(value) => onChange('bottom_rail_style', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="bottom_rail_style">
              <SelectValue placeholder="Select bottom rail style" />
            </SelectTrigger>
            <SelectContent>
              {bottomRailStyles.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} {opt.price > 0 && `(+$${opt.price.toFixed(2)})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Control Type */}
      {controlTypes.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="control_type">Control Type</Label>
          <Select 
            value={measurements.control_type || controlTypes[0]?.value} 
            onValueChange={(value) => onChange('control_type', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="control_type">
              <SelectValue placeholder="Select control type" />
            </SelectTrigger>
            <SelectContent>
              {controlTypes.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} {opt.price > 0 && `(+$${opt.price.toFixed(2)})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Chain Side - Only show if control type is chain */}
      {measurements.control_type === 'chain' && chainSides.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="chain_side">Chain Side</Label>
          <RadioGroup 
            value={measurements.chain_side || chainSides[0]?.value} 
            onValueChange={(value) => onChange('chain_side', value)}
            disabled={readOnly}
          >
            {chainSides.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`chain-${opt.value}`} />
                <Label htmlFor={`chain-${opt.value}`} className="font-normal cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Motor Type - Only show if control type is motorized */}
      {measurements.control_type === 'motorized' && motorTypes.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="motor_type">Motor Type</Label>
          <Select 
            value={measurements.motor_type || motorTypes[0]?.value} 
            onValueChange={(value) => onChange('motor_type', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="motor_type">
              <SelectValue placeholder="Select motor type" />
            </SelectTrigger>
            <SelectContent>
              {motorTypes.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} {opt.price > 0 && `(+$${opt.price.toFixed(2)})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};