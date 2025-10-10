
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { WindowCoveringOption } from "@/hooks/useWindowCoveringOptions";
import { getOptionPrice, getOptionPricingMethod } from "@/utils/optionDataAdapter";

interface OptionCardProps {
  option: WindowCoveringOption;
  isSelected: boolean;
  onToggle: () => void;
}

export const OptionCard = ({ option, isSelected, onToggle }: OptionCardProps) => {
  const price = getOptionPrice(option);
  const pricingMethod = getOptionPricingMethod(option);
  
  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <input
        type="checkbox"
        id={option.id}
        checked={isSelected}
        onChange={onToggle}
        disabled={option.is_required}
        className="rounded border-gray-300"
      />
      
      {option.image_url && (
        <img 
          src={option.image_url} 
          alt={option.name}
          className="w-12 h-12 object-cover rounded border"
        />
      )}
      
      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">{option.name}</span>
            {option.description && (
              <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              £{price} {pricingMethod}
            </Badge>
            {option.is_required && (
              <Badge variant="destructive" className="text-xs">Required</Badge>
            )}
            {option.is_default && (
              <Badge variant="default" className="text-xs">Default</Badge>
            )}
          </div>
        </div>
      </Label>
    </div>
  );
};
