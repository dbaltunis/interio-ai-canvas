import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface TreatmentType {
  id: string;
  name: string;
  curtain_type: string;
  fullness_ratio: number;
  pricing_type: string;
  heading_name?: string;
  created_at: string;
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
  // Filter treatments based on search query
  const filteredTreatments = treatments.filter(treatment =>
    treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    treatment.curtain_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (treatment.heading_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {categoryTreatments.map((treatment) => (
              <Card
                key={treatment.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedId === treatment.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => onSelect(treatment)}
              >
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-medium text-xs leading-tight line-clamp-2 flex-1">
                        {treatment.name}
                      </h4>
                      {selectedId === treatment.id && (
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {treatment.fullness_ratio}x
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                        {treatment.pricing_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};