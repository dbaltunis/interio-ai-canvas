
import { Button } from "@/components/ui/button";
import { Search, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useCurrency } from "@/hooks/useCurrency";

interface TreatmentCardProps {
  treatment: any;
}

export const TreatmentCard = ({ treatment }: TreatmentCardProps) => {
  const currency = useCurrency();
  
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
      {/* Fabric Image */}
      <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
        <img 
          src="/placeholder.svg" 
          alt="Fabric sample" 
          className="w-full h-full object-cover"
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
