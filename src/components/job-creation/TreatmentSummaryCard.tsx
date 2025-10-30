import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Package } from "lucide-react";
import { TreatmentTypeIndicator } from "../measurements/TreatmentTypeIndicator";
import { formatCurrency } from "@/utils/currency";

interface TreatmentSummaryCardProps {
  treatment: any;
  windowName: string;
  treatmentNumber: number;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}

export const TreatmentSummaryCard = ({
  treatment,
  windowName,
  treatmentNumber,
  onEdit,
  onView,
  onDelete
}: TreatmentSummaryCardProps) => {
  // Priority: treatment_name > name > fallback
  const treatmentName = treatment.treatment_name || treatment.name || `${windowName} - Treatment ${treatmentNumber}`;
  // CRITICAL: Use specific treatment_type first (e.g., 'venetian_blinds'), fall back to general type or category
  const treatmentType = treatment.treatment_type || treatment.type || treatment.treatment_category || "curtains";
  const totalCost = treatment.total_cost || treatment.calculated_cost || 0;

  return (
    <Card className="bg-muted/30 border-muted-foreground/20 shadow-sm hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary/40 flex-shrink-0" />
              <h4 className="font-semibold text-base truncate">{treatmentName}</h4>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <TreatmentTypeIndicator treatmentType={treatmentType} size="sm" />
              <Badge variant="outline" className="text-xs">
                Treatment {treatmentNumber}
              </Badge>
            </div>

            {totalCost > 0 && (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-lg text-primary">
                  {formatCurrency(totalCost)}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="h-8 text-primary hover:text-primary hover:border-primary/30"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-8 text-muted-foreground hover:text-foreground"
            >
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};