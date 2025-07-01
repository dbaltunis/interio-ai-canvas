
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { HierarchicalOption } from "@/hooks/useWindowCoveringOptions";
import { TraditionalOptions } from "./window-covering-options/TraditionalOptions";
import { HierarchicalOptions } from "./window-covering-options/HierarchicalOptions";
import { useHierarchicalSelections } from "./window-covering-options/useHierarchicalSelections";

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
  const { hierarchicalSelections, handleHierarchicalSelection } = useHierarchicalSelections();

  const handleHierarchicalSelectionWrapper = (categoryId: string, subcategoryId: string, value: string) => {
    handleHierarchicalSelection(categoryId, subcategoryId, value, onOptionToggle);
  };

  if (optionsLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4">Loading window covering options...</div>
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
    <Card>
      <CardHeader>
        <CardTitle>Window Covering Options</CardTitle>
        <p className="text-sm text-gray-600">Available options for {windowCovering?.name}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Traditional Options */}
        {hasTraditionalOptions && (
          <TraditionalOptions 
            options={options}
            selectedOptions={selectedOptions}
            onOptionToggle={onOptionToggle}
            currency={units.currency}
            hierarchicalSelections={hierarchicalSelections}
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
