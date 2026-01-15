import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { OptionValue } from '@/hooks/useTreatmentOptions';

interface OptionValuePickerProps {
  values: OptionValue[];
  selectedValues: string[];
  onChange: (selectedIds: string[]) => void;
  mode: 'single' | 'multi';
  label?: string;
}

export const OptionValuePicker = ({
  values,
  selectedValues,
  onChange,
  mode,
  label,
}: OptionValuePickerProps) => {
  if (!values || values.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
        No values available for this option
      </div>
    );
  }

  if (mode === 'single') {
    return (
      <div className="space-y-2">
        {label && <Label className="text-sm font-medium">{label}</Label>}
        <RadioGroup
          value={selectedValues[0] || ''}
          onValueChange={(value) => onChange([value])}
          className="space-y-2"
        >
          <ScrollArea className="h-[200px] pr-4">
            {values.map((value) => (
              <div
                key={value.id}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem value={value.id} id={value.id} />
                <Label
                  htmlFor={value.id}
                  className="flex-1 cursor-pointer flex items-center justify-between"
                >
                  <span>{value.label}</span>
                  {value.code && value.code !== value.label && (
                    <Badge variant="outline" className="text-xs ml-2">
                      {value.code}
                    </Badge>
                  )}
                </Label>
              </div>
            ))}
          </ScrollArea>
        </RadioGroup>
      </div>
    );
  }

  // Multi-select mode
  const handleToggle = (valueId: string) => {
    if (selectedValues.includes(valueId)) {
      onChange(selectedValues.filter((id) => id !== valueId));
    } else {
      onChange([...selectedValues, valueId]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>
          <Badge variant="secondary" className="text-xs">
            {selectedValues.length} selected
          </Badge>
        </div>
      )}
      <ScrollArea className="h-[200px] border rounded-md">
        <div className="p-2 space-y-1">
          {values.map((value) => (
            <div
              key={value.id}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleToggle(value.id)}
            >
              <Checkbox
                id={value.id}
                checked={selectedValues.includes(value.id)}
                onCheckedChange={() => handleToggle(value.id)}
              />
              <Label
                htmlFor={value.id}
                className="flex-1 cursor-pointer flex items-center justify-between"
              >
                <span>{value.label}</span>
                {value.code && value.code !== value.label && (
                  <Badge variant="outline" className="text-xs ml-2">
                    {value.code}
                  </Badge>
                )}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
