import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTreatmentOptions } from "@/hooks/useTreatmentOptions";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

interface DynamicRollerBlindFieldsProps {
  measurements: Record<string, any>;
  onChange: (field: string, value: string) => void;
  treatmentId?: string;
  readOnly?: boolean;
}

export const DynamicRollerBlindFields = ({ 
  measurements, 
  onChange, 
  treatmentId,
  readOnly = false 
}: DynamicRollerBlindFieldsProps) => {
  const { data: treatmentOptions = [], isLoading } = useTreatmentOptions(treatmentId);
  
  // Extract options by key (tube_size, mount_type, etc.)
  const getOptionsByKey = (key: string) => {
    const option = treatmentOptions.find(opt => opt.key === key && opt.visible);
    if (!option || !option.option_values) return [];
    
    return option.option_values
      .sort((a, b) => a.order_index - b.order_index)
      .map(val => ({
        value: val.code,
        label: val.label,
        id: val.id
      }));
  };

  const tubeSizes = useMemo(() => getOptionsByKey('tube_size'), [treatmentOptions]);
  const mountTypes = useMemo(() => getOptionsByKey('mount_type'), [treatmentOptions]);
  const fasciaTypes = useMemo(() => getOptionsByKey('fascia_type'), [treatmentOptions]);
  const bottomRailStyles = useMemo(() => getOptionsByKey('bottom_rail_style'), [treatmentOptions]);
  const controlTypes = useMemo(() => getOptionsByKey('control_type'), [treatmentOptions]);
  const chainSides = useMemo(() => getOptionsByKey('chain_side'), [treatmentOptions]);
  const motorTypes = useMemo(() => getOptionsByKey('motor_type'), [treatmentOptions]);
  const slatSizes = useMemo(() => getOptionsByKey('slat_size'), [treatmentOptions]);
  const slatMaterials = useMemo(() => getOptionsByKey('slat_material'), [treatmentOptions]);
  const headrailTypes = useMemo(() => getOptionsByKey('headrail_type'), [treatmentOptions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (treatmentOptions.length === 0) {
    return (
      <div className="p-4 border border-amber-300 bg-amber-50 rounded-lg">
        <p className="text-sm text-amber-800 font-medium">
          No window treatment options configured
        </p>
        <p className="text-xs text-amber-700 mt-1">
          Please add treatment options in Settings → Window Covering Templates → Treatment Settings tab
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Slat Material - for venetian blinds */}
      {slatMaterials.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="slat_material">Slat Material</Label>
          <Select 
            value={measurements.slat_material || slatMaterials[0]?.value} 
            onValueChange={(value) => onChange('slat_material', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="slat_material">
              <SelectValue placeholder="Select slat material" />
            </SelectTrigger>
            <SelectContent>
              {slatMaterials.map(opt => (
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Slat Size - for venetian blinds */}
      {slatSizes.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="slat_size">Slat Size</Label>
          <Select 
            value={measurements.slat_size || slatSizes[0]?.value} 
            onValueChange={(value) => onChange('slat_size', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="slat_size">
              <SelectValue placeholder="Select slat size" />
            </SelectTrigger>
            <SelectContent>
              {slatSizes.map(opt => (
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Headrail Type */}
      {headrailTypes.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="headrail_type">Headrail Type</Label>
          <Select 
            value={measurements.headrail_type || headrailTypes[0]?.value} 
            onValueChange={(value) => onChange('headrail_type', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="headrail_type">
              <SelectValue placeholder="Select headrail type" />
            </SelectTrigger>
            <SelectContent>
              {headrailTypes.map(opt => (
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tube Size - for roller blinds */}
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
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
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
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
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
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
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
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
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
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
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
              <div key={opt.id} className="flex items-center space-x-2">
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
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};