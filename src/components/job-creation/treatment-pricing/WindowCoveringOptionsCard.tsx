import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { HierarchicalOption } from "@/hooks/useWindowCoveringOptions";
import { CascadingTraditionalOptions } from "./window-covering-options/CascadingTraditionalOptions";
import { HierarchicalOptions } from "./window-covering-options/HierarchicalOptions";
import { useHierarchicalSelections } from "./window-covering-options/useHierarchicalSelections";
import { OptionCardSkeleton } from "@/components/shared/SkeletonLoader";
import { useCallback } from "react";

interface WindowCoveringOptionsCardProps {
  options: any[];
  hierarchicalOptions?: HierarchicalOption[];
  optionsLoading: boolean;
  windowCovering: any;
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
}

export const WindowCoveringOptionsCard = ({ 
  options, 
  hierarchicalOptions = [],
  optionsLoading, 
  windowCovering, 
  selectedOptions, 
  onOptionToggle 
}: WindowCoveringOptionsCardProps) => {
  const { units } = useMeasurementUnits();
  
  // Pass onOptionToggle to the hook so it can trigger value recording during auto-selection
  const { hierarchicalSelections, handleHierarchicalSelection } = useHierarchicalSelections(
    hierarchicalOptions,
    onOptionToggle
  );

  const handleHierarchicalSelectionWrapper = useCallback((
    categoryId: string, 
    subcategoryId: string, 
    value: string
  ) => {
    handleHierarchicalSelection(categoryId, subcategoryId, value, onOptionToggle);
  }, [handleHierarchicalSelection, onOptionToggle]);

  // Handle cascading single-selection: deselect previous, select new
  // Use functional approach to avoid stale closure issues
  const handleCascadingSelect = useCallback((
    optionType: string, 
    newOptionId: string | null, 
    previousOptionId: string | null
  ) => {
    // Deselect previous option for this type if exists
    if (previousOptionId) {
      onOptionToggle(previousOptionId);
    }
    // Select new option if provided
    if (newOptionId) {
      onOptionToggle(newOptionId);
    }
  }, [onOptionToggle]);

  if (optionsLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Window Covering Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <OptionCardSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!windowCovering) {
    return null;
  }

  const hasTraditionalOptions = options && options.length > 0;
  const hasHierarchicalOptions = hierarchicalOptions && hierarchicalOptions.length > 0;

  if (!hasTraditionalOptions && !hasHierarchicalOptions) {
    return null;
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Window Covering Options</CardTitle>
        <p className="text-sm text-muted-foreground">Available options for {windowCovering?.name}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Traditional Options - Now using cascading single-selection */}
        {hasTraditionalOptions && (
          <CascadingTraditionalOptions 
            options={options}
            selectedOptions={selectedOptions}
            onOptionSelect={handleCascadingSelect}
            currency={units.currency}
            hierarchicalSelections={hierarchicalSelections}
            templateId={windowCovering?.curtain_template_id}
          />
        )}

        {/* Hierarchical Options */}
        {hasHierarchicalOptions && (
          <HierarchicalOptions 
            hierarchicalOptions={hierarchicalOptions}
            selectedOptions={selectedOptions}
            onOptionToggle={onOptionToggle}
            currency={units.currency}
            hierarchicalSelections={hierarchicalSelections}
            onHierarchicalSelection={handleHierarchicalSelectionWrapper}
          />
        )}
      </CardContent>
    </Card>
  );
};
