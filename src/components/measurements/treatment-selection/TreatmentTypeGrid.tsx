import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface TreatmentType {
  id: string;
  name: string;
  curtain_type: string;
  fullness_ratio: number;
  pricing_type: string;
  heading_name?: string;
  created_at: string;
  image_url?: string;
  display_image_url?: string;
}

interface TreatmentTypeGridProps {
  treatments: TreatmentType[];
  selectedId?: string;
  onSelect: (treatment: TreatmentType) => void;
  searchQuery?: string;
}

export const TreatmentTypeGrid = ({
  treatments,
  selectedId,
  onSelect,
  searchQuery = ""
}: TreatmentTypeGridProps) => {
  const selectedCardRef = useRef<HTMLDivElement>(null);

  // Filter treatments based on search query
  const filteredTreatments = treatments.filter(treatment =>
    treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    treatment.curtain_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (treatment.heading_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-scroll to selected treatment when component mounts or selection changes
  useEffect(() => {
    if (selectedCardRef.current && selectedId) {
      selectedCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [selectedId]);

  // Group treatments by curtain type for better organization
  const groupedTreatments = filteredTreatments.reduce((acc, treatment) => {
    const category = treatment.curtain_type || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(treatment);
    return acc;
  }, {} as Record<string, TreatmentType[]>);

  if (filteredTreatments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {searchQuery ? "No treatments match your search" : "No treatments available"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedTreatments).map(([category, categoryTreatments]) => (
        <div key={category} className="space-y-2">
          <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground px-1">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {categoryTreatments.map((treatment) => {
              const isSelected = selectedId === treatment.id;
              
              return (
                <Card
                  key={treatment.id}
                  ref={isSelected ? selectedCardRef : null}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => onSelect(treatment)}
                >
                  <CardContent className="p-2">
                    <div className="flex flex-col items-center space-y-2">
                      {/* Image preview or placeholder */}
                      <div className="aspect-square w-full flex items-center justify-center bg-muted border border-border rounded overflow-hidden">
                        {treatment.image_url || treatment.display_image_url ? (
                          <img 
                            src={treatment.display_image_url || treatment.image_url} 
                            alt={treatment.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-muted-foreground text-xs">No preview</div>
                        )}
                      </div>
                      
                      <div className="text-center w-full">
                        <div className="flex items-center justify-center gap-2">
                          <h4 className="text-sm font-semibold truncate">{treatment.name}</h4>
                          {isSelected && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};