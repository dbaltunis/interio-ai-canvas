
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface ExtraOptionCardProps {
  extra: {
    id: string;
    name: string;
    description?: string;
    base_price: number;
    image_url?: string;
    is_required: boolean;
    is_default: boolean;
  };
  isSelected: boolean;
  onToggle: () => void;
}

export const ExtraOptionCard = ({ extra, isSelected, onToggle }: ExtraOptionCardProps) => {
  return (
    <div className="ml-6 flex items-center space-x-3 p-2 border rounded-lg bg-gray-50">
      <input
        type="checkbox"
        id={extra.id}
        checked={isSelected}
        onChange={onToggle}
        disabled={extra.is_required}
        className="rounded border-gray-300"
      />
      
      {extra.image_url && (
        <img 
          src={extra.image_url} 
          alt={extra.name}
          className="w-8 h-8 object-cover rounded border"
        />
      )}
      
      <Label htmlFor={extra.id} className="flex-1 cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium">{extra.name}</span>
            {extra.description && (
              <p className="text-xs text-muted-foreground">{extra.description}</p>
            )}
            {extra.is_required && <span className="text-xs text-red-600">• Required</span>}
            {extra.is_default && <span className="text-xs text-blue-600">• Default</span>}
          </div>
          <Badge variant="outline" className="text-xs">
            £{extra.base_price}
          </Badge>
        </div>
      </Label>
    </div>
  );
};
