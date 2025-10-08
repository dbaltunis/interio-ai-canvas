import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEnhancedInventoryByCategory } from "@/hooks/useEnhancedInventory";
import { Loader2 } from "lucide-react";

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
  // Predefined options for all roller blind fields
  const tubeSizes = ['25', '32', '38', '45', '50', '63', '70'];
  const mountTypes = ['inside_mount', 'outside_mount', 'ceiling_mount', 'wall_mount'];
  const fasciaTypes = ['none', 'standard_fascia', 'designer_fascia', 'full_cassette', 'semi_cassette'];
  const bottomRailStyles = ['standard', 'weighted', 'decorative', 'aluminum', 'steel'];
  const controlTypes = ['chain', 'motorized', 'spring', 'cordless'];
  const chainSides = ['left', 'right'];
  const motorTypes = ['battery', 'hardwired', 'rechargeable', 'solar'];

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
            value={measurements.tube_size || tubeSizes[0]} 
            onValueChange={(value) => onChange('tube_size', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="tube_size">
              <SelectValue placeholder="Select tube size" />
            </SelectTrigger>
            <SelectContent>
              {tubeSizes.map(size => (
                <SelectItem key={size} value={size}>
                  {size}mm
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
            value={measurements.mount_type || mountTypes[0]} 
            onValueChange={(value) => onChange('mount_type', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="mount_type">
              <SelectValue placeholder="Select mount type" />
            </SelectTrigger>
            <SelectContent>
              {mountTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {formatLabel(type)}
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
            value={measurements.fascia_type || fasciaTypes[0]} 
            onValueChange={(value) => onChange('fascia_type', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="fascia_type">
              <SelectValue placeholder="Select fascia type" />
            </SelectTrigger>
            <SelectContent>
              {fasciaTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {formatLabel(type)}
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
            value={measurements.bottom_rail_style || bottomRailStyles[0]} 
            onValueChange={(value) => onChange('bottom_rail_style', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="bottom_rail_style">
              <SelectValue placeholder="Select bottom rail style" />
            </SelectTrigger>
            <SelectContent>
              {bottomRailStyles.map(style => (
                <SelectItem key={style} value={style}>
                  {formatLabel(style)}
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
            value={measurements.control_type || controlTypes[0]} 
            onValueChange={(value) => onChange('control_type', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="control_type">
              <SelectValue placeholder="Select control type" />
            </SelectTrigger>
            <SelectContent>
              {controlTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {formatLabel(type)}
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
            value={measurements.chain_side || chainSides[0]} 
            onValueChange={(value) => onChange('chain_side', value)}
            disabled={readOnly}
          >
            {chainSides.map(side => (
              <div key={side} className="flex items-center space-x-2">
                <RadioGroupItem value={side} id={`chain-${side}`} />
                <Label htmlFor={`chain-${side}`} className="font-normal cursor-pointer">
                  {formatLabel(side)} Side
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
            value={measurements.motor_type || motorTypes[0]} 
            onValueChange={(value) => onChange('motor_type', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="motor_type">
              <SelectValue placeholder="Select motor type" />
            </SelectTrigger>
            <SelectContent>
              {motorTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {formatLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};