import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';

// Standard heading types that can be filtered
const HEADING_TYPES = [
  { key: 'eyelet', label: 'Eyelet' },
  { key: 'pleated', label: 'Pleated' },
  { key: 'rod_pocket', label: 'Rod Pocket' },
  { key: 'wave', label: 'Wave' },
  { key: 'european', label: 'European' },
  { key: 's_fold', label: 'S-Fold' },
  { key: 'ripple_fold', label: 'Ripple Fold' },
  { key: 'pinch_pleat', label: 'Pinch Pleat' },
  { key: 'goblet', label: 'Goblet' },
  { key: 'box_pleat', label: 'Box Pleat' },
];

interface HeadingFilterProps {
  selectedHeadings: string[];
  onChange: (headings: string[]) => void;
  disabled?: boolean;
}

export const HeadingFilter = ({ selectedHeadings, onChange, disabled }: HeadingFilterProps) => {
  const [open, setOpen] = useState(false);

  const toggleHeading = (heading: string) => {
    if (selectedHeadings.includes(heading)) {
      onChange(selectedHeadings.filter(h => h !== heading));
    } else {
      onChange([...selectedHeadings, heading]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectAll = () => {
    onChange(HEADING_TYPES.map(h => h.key));
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Applies to Headings</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            disabled={disabled}
          >
            <Filter className="h-3 w-3 mr-2" />
            {selectedHeadings.length === 0 
              ? 'All headings' 
              : `${selectedHeadings.length} heading${selectedHeadings.length > 1 ? 's' : ''}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Filter by Heading</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={selectAll}>All</Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
              </div>
            </div>
            
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {HEADING_TYPES.map(heading => (
                <label 
                  key={heading.key}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                >
                  <Checkbox
                    checked={selectedHeadings.includes(heading.key)}
                    onCheckedChange={() => toggleHeading(heading.key)}
                  />
                  <span className="text-sm">{heading.label}</span>
                </label>
              ))}
            </div>

            {selectedHeadings.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No filter = option applies to all headings
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Show selected headings as badges */}
      {selectedHeadings.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedHeadings.map(heading => {
            const headingInfo = HEADING_TYPES.find(h => h.key === heading);
            return (
              <Badge 
                key={heading} 
                variant="secondary" 
                className="text-xs cursor-pointer hover:bg-destructive/20"
                onClick={() => toggleHeading(heading)}
              >
                {headingInfo?.label || heading}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { HEADING_TYPES };
