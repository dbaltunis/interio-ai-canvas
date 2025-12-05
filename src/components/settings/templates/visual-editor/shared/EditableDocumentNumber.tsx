import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw, Hash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EditableDocumentNumberProps {
  value: string;
  recommendedNumber: string | null;
  onChange: (value: string) => void;
  isEditable?: boolean;
  label?: string;
}

export const EditableDocumentNumber: React.FC<EditableDocumentNumberProps> = ({
  value,
  recommendedNumber,
  onChange,
  isEditable = false,
  label = 'Invoice no #:'
}) => {
  const [localValue, setLocalValue] = useState(value || recommendedNumber || '');
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    // Initialize with recommended number if no value provided
    if (!value && recommendedNumber && !isCustom) {
      setLocalValue(recommendedNumber);
    }
  }, [recommendedNumber, value, isCustom]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    setIsCustom(true);
    onChange(newValue);
  };

  const handleReset = () => {
    if (recommendedNumber) {
      setLocalValue(recommendedNumber);
      setIsCustom(false);
      onChange(recommendedNumber);
    }
  };

  if (!isEditable) {
    return (
      <div>
        <span style={{ color: '#374151', fontWeight: '600', fontSize: '14px' }}>
          {label}{' '}
        </span>
        <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px' }}>
          {value || recommendedNumber || 'INV-0001'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span style={{ color: '#374151', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div className="flex items-center gap-1">
        <Input
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className="h-7 w-32 text-sm font-bold"
          placeholder="INV-0001"
        />
        {isCustom && recommendedNumber && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset to recommended: {recommendedNumber}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};
