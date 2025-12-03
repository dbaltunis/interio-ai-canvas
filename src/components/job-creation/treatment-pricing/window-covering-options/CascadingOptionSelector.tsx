import { useCallback } from "react";
import { CascadingOptionSelect } from "@/components/shared/CascadingOptionSelect";

interface CascadingOptionSelectorProps {
  optionType: string;
  options: any[];
  selectedOptionId: string | null;
  onSelect: (optionId: string | null, previousId?: string | null) => void;
  currency: string;
}

export const CascadingOptionSelector = ({
  optionType,
  options,
  selectedOptionId,
  onSelect,
  currency
}: CascadingOptionSelectorProps) => {
  // Memoize the handler to prevent stale closures
  const handleSelect = useCallback((newId: string | null, prevId: string | null) => {
    onSelect(newId, prevId);
  }, [onSelect]);

  return (
    <CascadingOptionSelect
      label={optionType}
      options={options}
      selectedId={selectedOptionId}
      onSelect={handleSelect}
      currency={currency}
    />
  );
};
