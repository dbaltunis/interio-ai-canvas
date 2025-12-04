import { Button } from "@/components/ui/button";
import { Search, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useCurrency } from "@/hooks/useCurrency";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";

interface TreatmentCardProps {
  treatment: any;
}

export const TreatmentCard = ({ treatment }: TreatmentCardProps) => {
  const currency = useCurrency();
  
  // Determine if this is a material-based treatment
  const isMaterialBased = ['venetian_blinds', 'vertical_blinds', 'cellular_blinds', 'roller_blinds', 'blinds', 'shutters'].some(
    type => treatment.treatment_type?.toLowerCase().includes(type.replace('_', ' ')) || treatment.treatment_type?.toLowerCase().includes(type)
  );
  
  // Get image and color from fabric or material details
  const imageUrl = treatment.fabric_details?.image_url || treatment.material_details?.image_url;
  const productColor = treatment.fabric_details?.color || treatment.material_details?.color || treatment.color;
  const productName = treatment.fabric_details?.name || treatment.material_details?.name || treatment.product_name || treatment.treatment_type;
  
  const getFabricDetails = (treatmentType: string) => {
    switch (treatmentType) {
      case "Curtains":
        return {
          railWidth: "300 cm",
          heading: "Eyelet Curtain", 
          eyeletRing: "Gold rings 8mm",
          drop: "200 cm",
          lining: "Blackout",
          fabric: "SAG/02 Monday Blues",
          price: "£76.67"
        };
      default:
        return {
          railWidth: "200 cm",
          heading: "Pencil Pleat",
          eyeletRing: "Standard rings",
          drop: "250 cm",
          lining: "Blackout", 
          fabric: "Sky Gray 01",
          price: formatCurrency(treatment.total_price || 0, currency)
        };
    }
  };

  const details = getFabricDetails(treatment.treatment_type);

  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg bg-white">
      {/* Fabric/Material Image with proper fallback */}
      <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded">
        <ProductImageWithColorFallback
          imageUrl={imageUrl}
          color={productColor}
          productName={productName}
          category={isMaterialBased ? 'material' : 'fabric'}
          size={80}
          rounded="md"
        />
      </div>
      
      {/* Treatment Details Grid */}
      <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
        <div>
          <p className="font-medium text-gray-900">{treatment.treatment_type}</p>
          <p className="text-gray-600 mt-1">Rail width</p>
          <p className="text-gray-600">Heading name</p>
          <p className="text-gray-600">Eyelet Ring</p>
        </div>
        
        <div>
          <p className="text-gray-900">{details.railWidth}</p>
          <p className="text-gray-900 mt-1">{details.heading}</p>
          <p className="text-gray-900">{details.eyeletRing}</p>
        </div>
        
        <div>
          <p className="text-gray-600">Curtain drop</p>
          <p className="text-gray-600 mt-1">Lining</p>
          <p className="text-gray-600">Fabric article</p>
          <p className="text-gray-600">Fabric price</p>
        </div>
        
        <div>
          <p className="text-gray-900">{details.drop}</p>
          <p className="text-gray-900 mt-1">{details.lining}</p>
          <p className="text-gray-900">{details.fabric}</p>
          <p className="text-gray-900 font-medium">{details.price}</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="ghost" title="View details">
          <Search className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" title="Delete treatment">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
