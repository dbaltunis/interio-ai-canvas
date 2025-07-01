
import { type HierarchicalOption } from "@/hooks/useWindowCoveringOptions";
import { HierarchicalOptionCard } from "./HierarchicalOptionCard";
import { ExtraOptionCard } from "./ExtraOptionCard";

interface HierarchicalOptionsSectionProps {
  hierarchicalOptions: HierarchicalOption[];
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
  isMotorisedSelected: () => boolean;
}

export const HierarchicalOptionsSection = ({ 
  hierarchicalOptions, 
  selectedOptions, 
  onOptionToggle,
  isMotorisedSelected 
}: HierarchicalOptionsSectionProps) => {
  return (
    <>
      {hierarchicalOptions.map((category) => (
        <div key={category.id} className="space-y-4">
          <h4 className="font-medium text-brand-primary">{category.name}</h4>
          {category.description && (
            <p className="text-sm text-muted-foreground">{category.description}</p>
          )}

          {category.subcategories?.map((subcategory) => (
            <div key={subcategory.id} className="ml-4 space-y-3">
              <h5 className="font-medium text-gray-800">{subcategory.name}</h5>
              
              {subcategory.sub_subcategories?.map((subSub) => (
                <div key={subSub.id} className="ml-4 space-y-2">
                  <HierarchicalOptionCard
                    option={subSub}
                    isSelected={selectedOptions.includes(subSub.id)}
                    onToggle={() => onOptionToggle(subSub.id)}
                  />

                  {/* Extras - apply conditional logic */}
                  {subSub.extras?.map((extra) => {
                    // Apply same conditional logic for extras
                    if (extra.name.toLowerCase().includes('remote') && !isMotorisedSelected()) {
                      return null;
                    }

                    return (
                      <ExtraOptionCard
                        key={extra.id}
                        extra={extra}
                        isSelected={selectedOptions.includes(extra.id)}
                        onToggle={() => onOptionToggle(extra.id)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  );
};
