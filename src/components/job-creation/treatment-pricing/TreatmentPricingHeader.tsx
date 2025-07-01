
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface TreatmentPricingHeaderProps {
  productName: string;
  onNameChange: (name: string) => void;
  windowCovering?: any;
}

export const TreatmentPricingHeader = ({ 
  productName, 
  onNameChange, 
  windowCovering 
}: TreatmentPricingHeaderProps) => {
  const [isEditingName, setIsEditingName] = useState(false);

  const handleNameSave = () => {
    setIsEditingName(false);
  };

  return (
    <div className="text-center space-y-3">
      {isEditingName ? (
        <div className="flex items-center justify-center gap-2">
          <Input
            value={productName}
            onChange={(e) => onNameChange(e.target.value)}
            className="text-center text-lg font-semibold max-w-md"
            autoFocus
            onBlur={handleNameSave}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
          />
        </div>
      ) : (
        <h3 
          className="text-lg font-semibold cursor-pointer hover:text-brand-primary transition-colors"
          onClick={() => setIsEditingName(true)}
        >
          {productName}
        </h3>
      )}
      
      {windowCovering?.image_url && (
        <div className="flex justify-center">
          <img 
            src={windowCovering.image_url} 
            alt={windowCovering.name}
            className="w-24 h-24 object-cover rounded-lg border shadow-sm"
          />
        </div>
      )}
    </div>
  );
};
