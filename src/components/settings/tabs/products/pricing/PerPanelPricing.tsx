import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PerPanelPricingProps {
  machinePricePerPanel: string;
  handPricePerPanel: string;
  offersHandFinished: boolean;
  onInputChange: (field: string, value: string) => void;
}

export const PerPanelPricing = ({
  machinePricePerPanel,
  handPricePerPanel,
  offersHandFinished,
  onInputChange
}: PerPanelPricingProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
        <h4 className="font-medium text-sm text-green-900 dark:text-green-100">🟩 Per Panel Pricing</h4>
        <p className="text-xs text-green-800 dark:text-green-200 mt-1">
          Fixed price per finished curtain panel regardless of fabric complexity. 
          Price stays the same whether you need 1 drop or 5 drops to make the panel.
        </p>
      </div>
      
      <div className="bg-primary/10 p-3 rounded-lg">
        <h5 className="font-medium text-xs text-primary">Calculation Example:</h5>
        <p className="text-xs text-primary/80 mt-1">
          Pair of curtains (2 panels) regardless of fabric complexity<br/>
          Final price: 2 panels × £{machinePricePerPanel || '180'} = £{(2 * parseFloat(machinePricePerPanel || '180')).toFixed(2)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="machine_price_per_panel">Machine Price per Panel</Label>
          <Input
            id="machine_price_per_panel"
            type="number"
            step="0.01"
            value={machinePricePerPanel}
            onChange={(e) => onInputChange("machine_price_per_panel", e.target.value)}
            placeholder="180.00"
          />
          <p className="text-xs text-muted-foreground mt-1">Fixed price per finished curtain (doesn't scale)</p>
        </div>
        {offersHandFinished && (
          <div>
            <Label htmlFor="hand_price_per_panel">Hand-Finished Price per Panel</Label>
            <Input
              id="hand_price_per_panel"
              type="number"
              step="0.01"
              value={handPricePerPanel}
              onChange={(e) => onInputChange("hand_price_per_panel", e.target.value)}
              placeholder="280.00"
            />
            <p className="text-xs text-muted-foreground mt-1">Hand-finished premium per panel</p>
          </div>
        )}
      </div>
    </div>
  );
};