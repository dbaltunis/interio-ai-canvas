
import { type WindowCoveringOption } from "@/hooks/useWindowCoveringOptions";
import { OptionCard } from "./OptionCard";

interface OptionTypeSectionProps {
  optionType: string;
  options: WindowCoveringOption[];
  selectedOptions: string[];
  onOptionToggle: (optionId: string) => void;
}

export const OptionTypeSection = ({ 
  optionType, 
  options, 
  selectedOptions, 
  onOptionToggle 
}: OptionTypeSectionProps) => {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-brand-primary capitalize">{optionType}</h4>
      <div className="grid grid-cols-1 gap-3">
        {options.map(option => (
          <OptionCard
            key={option.id}
            option={option}
            isSelected={selectedOptions.includes(option.id)}
            onToggle={() => onOptionToggle(option.id)}
          />
        ))}
      </div>
    </div>
  );
};
