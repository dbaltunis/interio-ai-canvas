
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type WindowCoveringOption, type HierarchicalOption } from "@/hooks/useWindowCoveringOptions";
import { OptionTypeSection } from "./options/OptionTypeSection";
import { HierarchicalOptionsSection } from "./options/HierarchicalOptionsSection";
import { useOptionFiltering } from "./options/useOptionFiltering";

interface OptionsSelectorProps {
  availableOptions: WindowCoveringOption[];
  hierarchicalOptions?: HierarchicalOption[];
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
  isLoading: boolean;
}

export const OptionsSelector = ({ 
  availableOptions, 
  hierarchicalOptions = [],
  selectedOptions, 
  onOptionToggle, 
  isLoading 
}: OptionsSelectorProps) => {
  const { isMotorisedSelected, getFilteredOptions } = useOptionFiltering(availableOptions, selectedOptions);
  
  const hasTraditionalOptions = availableOptions.length > 0;
  const hasHierarchicalOptions = hierarchicalOptions.length > 0;

  if (!hasTraditionalOptions && !hasHierarchicalOptions && !isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No options configured for this window covering.</p>
        </CardContent>
      </Card>
    );
  }

  // Group traditional options by type for better organization
  const groupedOptions = availableOptions.reduce((acc: Record<string, WindowCoveringOption[]>, option) => {
    if (!acc[option.option_type]) {
      acc[option.option_type] = [];
    }
    acc[option.option_type].push(option);
    return acc;
  }, {} as Record<string, WindowCoveringOption[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Options</CardTitle>
        <CardDescription>
          Choose from available options for this window covering
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="text-center py-4">Loading options...</div>
        ) : (
          <>
            {/* Traditional Options */}
            {hasTraditionalOptions && Object.entries(groupedOptions).map(([optionType, options]) => {
              // Filter options based on current selections
              const filteredOptions = getFilteredOptions(options);
              
              if (filteredOptions.length === 0) {
                return null;
              }

              return (
                <OptionTypeSection
                  key={optionType}
                  optionType={optionType}
                  options={filteredOptions}
                  selectedOptions={selectedOptions}
                  onOptionToggle={onOptionToggle}
                />
              );
            })}

            {/* Hierarchical Options */}
            {hasHierarchicalOptions && (
              <HierarchicalOptionsSection
                hierarchicalOptions={hierarchicalOptions}
                selectedOptions={selectedOptions}
                onOptionToggle={onOptionToggle}
                isMotorisedSelected={isMotorisedSelected}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
