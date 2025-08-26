import React from "react";
import { Badge } from "@/components/ui/badge";
import { Blinds, Layers, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreatmentTypeIndicatorProps {
  treatmentType: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const TREATMENT_TYPES = {
  curtains: {
    label: "Curtains",
    icon: Layers,
    color: "bg-blue-100 text-blue-700 border-blue-200"
  },
  blinds: {
    label: "Blinds", 
    icon: Blinds,
    color: "bg-green-100 text-green-700 border-green-200"
  },
  shutters: {
    label: "Shutters",
    icon: Square,
    color: "bg-amber-100 text-amber-700 border-amber-200"
  },
  valance: {
    label: "Valance",
    icon: Layers,
    color: "bg-purple-100 text-purple-700 border-purple-200"
  },
  pelmet: {
    label: "Pelmet",
    icon: Square,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200"
  }
};

export const TreatmentTypeIndicator = ({ 
  treatmentType, 
  size = "sm", 
  showIcon = true 
}: TreatmentTypeIndicatorProps) => {
  const treatment = TREATMENT_TYPES[treatmentType as keyof typeof TREATMENT_TYPES] || {
    label: treatmentType,
    icon: Square,
    color: "bg-muted text-muted-foreground border-muted"
  };

  const Icon = treatment.icon;
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        treatment.color, 
        sizeClasses[size], 
        "flex items-center gap-1.5 font-medium transition-all duration-200 hover:shadow-sm hover:scale-105"
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {treatment.label}
    </Badge>
  );
};