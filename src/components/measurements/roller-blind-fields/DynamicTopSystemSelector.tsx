import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { useEnhancedInventoryByCategory } from "@/hooks/useEnhancedInventory";
import { Loader2 } from "lucide-react";

interface DynamicTopSystemSelectorProps {
  selectedTopSystemId?: string;
  onChange: (systemId: string, systemData: any) => void;
  treatmentType: string;
  readOnly?: boolean;
}

export const DynamicTopSystemSelector = ({ 
  selectedTopSystemId, 
  onChange, 
  treatmentType,
  readOnly = false 
}: DynamicTopSystemSelectorProps) => {
  const { data: topSystems = [], isLoading } = useEnhancedInventoryByCategory('top_system');
  
  // Filter top systems based on treatment type
  const filteredSystems = topSystems.filter(system => 
    !system.treatment_type || system.treatment_type === treatmentType
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (filteredSystems.length === 0) {
    return (
      <div className="p-4 border border-amber-300 bg-amber-50 rounded-lg">
        <p className="text-sm text-amber-800 font-medium">
          No top systems configured for {treatmentType.replace('_', ' ')}
        </p>
        <p className="text-xs text-amber-700 mt-1">
          Please create top systems in Settings → Window Coverings → Top Systems
        </p>
      </div>
    );
  }

  const parseSystemDetails = (system: any) => {
    try {
      if (system.description) {
        return JSON.parse(system.description);
      }
    } catch (e) {
      console.log('Could not parse system details');
    }
    return {};
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Select Top System Configuration</Label>
      <p className="text-sm text-muted-foreground">
        Choose a pre-configured system setup
      </p>
      
      <RadioGroup 
        value={selectedTopSystemId || ''} 
        onValueChange={(value) => {
          const system = filteredSystems.find(s => s.id === value);
          if (system) {
            const details = parseSystemDetails(system);
            onChange(value, {
              systemId: value,
              systemName: system.name,
              ...details
            });
          }
        }}
        disabled={readOnly}
        className="space-y-3"
      >
        {filteredSystems.map((system) => {
          const details = parseSystemDetails(system);
          const isSelected = selectedTopSystemId === system.id;
          
          return (
            <Card 
              key={system.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <RadioGroupItem 
                    value={system.id} 
                    id={`system-${system.id}`}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Label 
                        htmlFor={`system-${system.id}`}
                        className="font-semibold cursor-pointer text-base"
                      >
                        {system.name}
                      </Label>
                      {system.price_per_meter && system.price_per_meter > 0 && (
                        <span className="text-sm font-medium text-primary">
                          +${system.price_per_meter.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {(system as any).image_url && (
                      <img 
                        src={(system as any).image_url} 
                        alt={system.name}
                        className="mt-2 w-20 h-20 object-cover rounded border"
                      />
                    )}
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {details.tube_size && (
                        <div>
                          <span className="font-medium">Tube:</span> {details.tube_size}mm
                        </div>
                      )}
                      {details.mount_type && (
                        <div>
                          <span className="font-medium">Mount:</span> {details.mount_type.replace('_', ' ')}
                        </div>
                      )}
                      {details.fascia_type && (
                        <div>
                          <span className="font-medium">Fascia:</span> {details.fascia_type.replace('_', ' ')}
                        </div>
                      )}
                      {details.bottom_rail_style && (
                        <div>
                          <span className="font-medium">Bottom Rail:</span> {details.bottom_rail_style}
                        </div>
                      )}
                      {details.control_type && (
                        <div>
                          <span className="font-medium">Control:</span> {details.control_type}
                        </div>
                      )}
                      {details.chain_side && details.control_type === 'chain' && (
                        <div>
                          <span className="font-medium">Chain Side:</span> {details.chain_side}
                        </div>
                      )}
                      {details.motor_type && details.control_type === 'motorized' && (
                        <div>
                          <span className="font-medium">Motor:</span> {details.motor_type}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </RadioGroup>
    </div>
  );
};