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
    <div className="space-y-6">
      {Object.entries(groupedTreatments).map(([category, categoryTreatments]) => (
        <div key={category} className="space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b pb-2">
            {category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryTreatments.map((treatment) => (
              <Card
                key={treatment.id}
                className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
                  selectedId === treatment.id
                    ? "ring-2 ring-primary bg-primary/5 shadow-lg"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => onSelect(treatment)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm leading-tight">
                        {treatment.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {treatment.heading_name || "Standard"}
                      </p>
                    </div>
                    {selectedId === treatment.id && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Fullness:</span>
                      <Badge variant="outline" className="text-xs">
                        {treatment.fullness_ratio}x
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Pricing:</span>
                      <span className="text-xs font-medium">
                        {treatment.pricing_type.replace('_', ' ')}
                      </span>
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