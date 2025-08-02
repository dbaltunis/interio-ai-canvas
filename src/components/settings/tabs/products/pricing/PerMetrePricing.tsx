import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PerMetrePricingProps {
  machinePricePerMetre: string;
  handPricePerMetre: string;
  offersHandFinished: boolean;
  onInputChange: (field: string, value: string) => void;
}

export const PerMetrePricing = ({
  machinePricePerMetre,
  handPricePerMetre,
  offersHandFinished,
  onInputChange
}: PerMetrePricingProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="machine_price_per_metre">Machine Price per Metre</Label>
          <Input
            id="machine_price_per_metre"
            type="number"
            step="0.01"
            value={machinePricePerMetre}
            onChange={(e) => onInputChange("machine_price_per_metre", e.target.value)}
            placeholder="20.00"
          />
        </div>
        {offersHandFinished && (
          <div>
            <Label htmlFor="hand_price_per_metre">Hand-Finished Price per Metre</Label>
            <Input
              id="hand_price_per_metre"
              type="number"
              step="0.01"
              value={handPricePerMetre}
              onChange={(e) => onInputChange("hand_price_per_metre", e.target.value)}
              placeholder="35.00"
            />
          </div>
        )}
      </div>
    </div>
  );
};