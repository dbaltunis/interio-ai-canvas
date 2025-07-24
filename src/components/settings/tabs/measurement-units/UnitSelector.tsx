
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UnitSelectorProps {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onValueChange: (value: string) => void;
}

export const UnitSelector = ({ id, label, value, options, onValueChange }: UnitSelectorProps) => {
  // Filter out options with empty string values to prevent Radix UI error
  const validOptions = options.filter(option => option.value && option.value.trim() !== "");
  
  console.log('UnitSelector - Original options:', options);
  console.log('UnitSelector - Valid options after filtering:', validOptions);
  console.log('UnitSelector - Current value:', value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {validOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
