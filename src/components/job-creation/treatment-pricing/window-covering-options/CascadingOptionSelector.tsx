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
  return (
    <CascadingOptionSelect
      label={optionType}
      options={options}
      selectedId={selectedOptionId}
      onSelect={(newId, prevId) => onSelect(newId, prevId)}
      currency={currency}
    />
  );
};
