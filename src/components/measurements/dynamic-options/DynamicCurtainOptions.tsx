import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { Loader2 } from "lucide-react";
import { useHeadingInventory } from "@/hooks/useHeadingInventory";

interface DynamicCurtainOptionsProps {
  measurements: Record<string, any>;
  onChange: (field: string, value: any) => void;
  template?: any; // The selected curtain template
  readOnly?: boolean;
  onOptionPriceChange?: (optionKey: string, price: number, label: string) => void;
  selectedOptions?: Array<{ name: string; price: number }>;
}

export const DynamicCurtainOptions = ({
  measurements,
  onChange,
  template,
  readOnly = false,
  onOptionPriceChange,
  selectedOptions = []
}: DynamicCurtainOptionsProps) => {
  // Early returns MUST come before hooks to prevent violations
  if (!template) {
    return (
      <div className="text-sm text-muted-foreground">
        Please select a curtain template first
      </div>
    );
  }

  // Hooks MUST be called unconditionally after early returns
  const { units } = useMeasurementUnits();
  const { data: headingOptions = [], isLoading: headingsLoading } = useHeadingInventory();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: units.currency || 'USD'
    }).format(amount);
  };

  const handleHeadingChange = (headingId: string) => {
    const heading = headingOptions.find(h => h.id === headingId);
    if (heading && onOptionPriceChange) {
      // Headings are stored in enhanced_inventory_items - use correct pricing fields
      const headingPrice = heading.price_per_meter || heading.selling_price || 0;
      onOptionPriceChange('heading', headingPrice, heading.name);
    }
    onChange('selected_heading', headingId);
  };

  const handleLiningChange = (liningType: string) => {
    const lining = template?.lining_types?.find((l: any) => l.type === liningType);
    if (lining && onOptionPriceChange) {
      const totalPrice = (lining.price_per_metre || 0) + (lining.labour_per_curtain || 0);
      onOptionPriceChange('lining', totalPrice, lining.type);
    }
    onChange('selected_lining', liningType);
  };

  const handlePricingMethodChange = (methodId: string) => {
    const method = template?.pricing_methods?.find((m: any) => m.id === methodId);
    if (method) {
      onChange('selected_pricing_method', methodId);
      // Update pricing type in measurements
      onChange('pricing_type', method.pricing_type);
    }
  };

  const handleManufacturingTypeChange = (type: 'machine' | 'hand') => {
    onChange('manufacturing_type', type);
    console.log('🏭 Manufacturing type changed to:', type);
  };

  if (headingsLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Get the selected pricing method to display correct prices
  const selectedPricingMethod = measurements.selected_pricing_method 
    ? template.pricing_methods?.find((m: any) => m.id === measurements.selected_pricing_method)
    : template.pricing_methods?.[0]; // Default to first method

  // Debug: Log template pricing to see what values we're getting
  console.log('💰 DynamicCurtainOptions pricing debug:', {
    templateName: template.name,
    selectedPricingMethodId: measurements.selected_pricing_method,
    selectedMethod: selectedPricingMethod,
    templateLevelPrices: {
      machine_price_per_metre: template.machine_price_per_metre,
      hand_price_per_metre: template.hand_price_per_metre,
      machine_price_per_drop: template.machine_price_per_drop,
      hand_price_per_drop: template.hand_price_per_drop,
    },
    methodLevelPrices: selectedPricingMethod ? {
      machine_price_per_metre: selectedPricingMethod.machine_price_per_metre,
      hand_price_per_metre: selectedPricingMethod.hand_price_per_metre,
      machine_price_per_drop: selectedPricingMethod.machine_price_per_drop,
      hand_price_per_drop: selectedPricingMethod.hand_price_per_drop,
      machine_price_per_panel: selectedPricingMethod.machine_price_per_panel,
      hand_price_per_panel: selectedPricingMethod.hand_price_per_panel,
    } : null,
    offers_hand_finished: template.offers_hand_finished,
    manufacturing_type: template.manufacturing_type,
    pricing_type: template.pricing_type
  });

  // Determine which prices to use - prefer pricing method prices, fallback to template prices
  const machinePricePerMetre = selectedPricingMethod?.machine_price_per_metre ?? template.machine_price_per_metre;
  const handPricePerMetre = selectedPricingMethod?.hand_price_per_metre ?? template.hand_price_per_metre;
  const machinePricePerDrop = selectedPricingMethod?.machine_price_per_drop ?? template.machine_price_per_drop;
  const handPricePerDrop = selectedPricingMethod?.hand_price_per_drop ?? template.hand_price_per_drop;
  const machinePricePerPanel = selectedPricingMethod?.machine_price_per_panel ?? template.machine_price_per_panel;
  const handPricePerPanel = selectedPricingMethod?.hand_price_per_panel ?? template.hand_price_per_panel;

  // Filter headings based on template's selected_heading_ids
  const availableHeadings = template.selected_heading_ids && template.selected_heading_ids.length > 0
    ? headingOptions.filter(h => template.selected_heading_ids.includes(h.id))
    : headingOptions;

  return (
    <div className="space-y-4">
      {/* Heading Selection */}
      {availableHeadings.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            Heading Type
            <Badge variant="secondary" className="text-xs">Required</Badge>
          </Label>
          <Select
            value={measurements.selected_heading || ''}
            onValueChange={handleHeadingChange}
          >
            <SelectTrigger className="bg-background border-input">
              <SelectValue placeholder="Select heading type" />
            </SelectTrigger>
            <SelectContent 
              className="bg-popover border-border"
              position="popper"
              sideOffset={5}
            >
              {availableHeadings.map(heading => (
                <SelectItem key={heading.id} value={heading.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>{heading.name}</span>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {(heading as any).fullness_ratio && (
                        <span>Fullness: {(heading as any).fullness_ratio}x</span>
                      )}
                      {(heading.price_per_meter || heading.selling_price) && (
                        <span>{formatCurrency(heading.price_per_meter || heading.selling_price || 0)}</span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Lining Selection */}
      {template.lining_types && template.lining_types.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Lining Type</Label>
          <Select
            value={measurements.selected_lining || ''}
            onValueChange={handleLiningChange}
          >
            <SelectTrigger className="bg-background border-input">
              <SelectValue placeholder="Select lining (optional)" />
            </SelectTrigger>
            <SelectContent 
              className="bg-popover border-border"
              position="popper"
              sideOffset={5}
            >
              <SelectItem value="none">No Lining</SelectItem>
              {template.lining_types.map((lining: any, index: number) => (
                <SelectItem key={index} value={lining.type}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>{lining.type}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency((lining.price_per_metre || 0) + (lining.labour_per_curtain || 0))}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Pricing Method Selection */}
      {template.pricing_methods && template.pricing_methods.length > 1 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            Pricing Method
            <Badge variant="secondary" className="text-xs">Choose fabric width</Badge>
          </Label>
          <Select
            value={measurements.selected_pricing_method || ''}
            onValueChange={handlePricingMethodChange}
          >
            <SelectTrigger className="bg-background border-input">
              <SelectValue placeholder="Select pricing method" />
            </SelectTrigger>
            <SelectContent 
              className="bg-popover border-border"
              position="popper"
              sideOffset={5}
            >
              {template.pricing_methods.map((method: any) => (
                <SelectItem key={method.id} value={method.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span>{method.name}</span>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {method.fabric_width_type === 'wide' ? 'Wide Fabric' : 'Narrow Fabric'}
                      </Badge>
                      <span>{method.pricing_type}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Manufacturing Type Selection - Machine vs Hand Finished */}
      {template.offers_hand_finished && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            Make-Up Type
            <Badge variant="secondary" className="text-xs">Affects pricing</Badge>
          </Label>
          <RadioGroup
            value={measurements.manufacturing_type || template.manufacturing_type || 'machine'}
            onValueChange={handleManufacturingTypeChange}
            className="grid grid-cols-2 gap-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="machine" id="machine" />
              <Label 
                htmlFor="machine" 
                className="cursor-pointer flex flex-col flex-1"
              >
                <span className="font-medium">Machine Finished</span>
                {machinePricePerMetre && machinePricePerMetre > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(machinePricePerMetre)}/m
                  </span>
                )}
                {machinePricePerDrop && machinePricePerDrop > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(machinePricePerDrop)}/drop
                  </span>
                )}
                {machinePricePerPanel && machinePricePerPanel > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(machinePricePerPanel)}/panel
                  </span>
                )}
                {!machinePricePerMetre && !machinePricePerDrop && !machinePricePerPanel && (
                  <span className="text-xs text-destructive">No price set</span>
                )}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hand" id="hand" />
              <Label 
                htmlFor="hand" 
                className="cursor-pointer flex flex-col flex-1"
              >
                <span className="font-medium">Hand Finished</span>
                {handPricePerMetre && handPricePerMetre > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(handPricePerMetre)}/m
                  </span>
                )}
                {handPricePerDrop && handPricePerDrop > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(handPricePerDrop)}/drop
                  </span>
                )}
                {handPricePerPanel && handPricePerPanel > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(handPricePerPanel)}/panel
                  </span>
                )}
                {!handPricePerMetre && !handPricePerDrop && !handPricePerPanel && (
                  <span className="text-xs text-destructive">No price set</span>
                )}
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

    </div>
  );
};