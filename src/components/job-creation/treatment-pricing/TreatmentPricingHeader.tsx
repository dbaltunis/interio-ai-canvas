import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useTemplateDisplayImage } from "@/hooks/useTreatmentCategoryImages";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";

interface TreatmentPricingHeaderProps {
  productName: string;
  onNameChange: (name: string) => void;
  windowCovering?: any;
  template?: any;
  selectedFabric?: any;
  selectedMaterial?: any;
}

export const TreatmentPricingHeader = ({ 
  productName, 
  onNameChange, 
  windowCovering,
  template,
  selectedFabric,
  selectedMaterial
}: TreatmentPricingHeaderProps) => {
  const [isEditingName, setIsEditingName] = useState(false);
  
  // Get the appropriate display image: selected fabric/material > template custom image > category default
  const categoryDefaultImage = useTemplateDisplayImage(template);
  
  // ✅ FIX: Priority: template display image FIRST > template image > fabric/material image > category default
  // This ensures treatment templates with custom images show their image when fabric has no image
  const displayImage = template?.display_image_url || template?.image_url || selectedFabric?.image_url || selectedMaterial?.image_url || categoryDefaultImage;
  const displayColor = selectedFabric?.color || selectedMaterial?.color;
  const displayName = selectedFabric?.name || selectedMaterial?.name || template?.name || windowCovering?.name || productName;
  
  // Determine category for icon fallback
  const isMaterialBased = template?.treatment_category && ['venetian_blinds', 'vertical_blinds', 'cellular_blinds', 'roller_blinds', 'shutters'].includes(template.treatment_category);

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
      
      {/* Display product image with proper fallbacks */}
      <div className="flex justify-center">
        <ProductImageWithColorFallback
          imageUrl={displayImage}
          color={displayColor}
          productName={displayName}
          category={isMaterialBased ? 'material' : 'fabric'}
          size={96}
          rounded="lg"
          className="border shadow-sm"
        />
      </div>
    </div>
  );
};
