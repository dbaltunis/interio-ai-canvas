import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hash } from "lucide-react";
import { useSequenceLabel, type EntityType } from "@/hooks/useNumberSequences";

interface EditableDocumentNumberProps {
  entityType: EntityType;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  autoLabel?: boolean;
}

export const EditableDocumentNumber = ({
  entityType,
  value,
  onChange,
  label: propLabel,
  placeholder = "Enter number",
  disabled = false,
  autoLabel = false,
}: EditableDocumentNumberProps) => {
  const { label: settingsLabel } = useSequenceLabel(entityType);
  
  // Use settings label if autoLabel is true, otherwise use prop
  const label = autoLabel ? settingsLabel : (propLabel || settingsLabel);

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Hash className="h-4 w-4" />
        {label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};
