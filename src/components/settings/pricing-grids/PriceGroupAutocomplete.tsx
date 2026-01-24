import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag, Package } from 'lucide-react';
import { useInventoryPriceGroups } from '@/hooks/useInventoryPriceGroups';
import { cn } from '@/lib/utils';

interface PriceGroupAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const PriceGroupAutocomplete = ({
  value,
  onChange,
  placeholder = "e.g., A, B, C, GROUP-1",
  className
}: PriceGroupAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: priceGroups = [], isLoading } = useInventoryPriceGroups();

  // Filter suggestions based on input
  const filteredGroups = priceGroups.filter(group =>
    group.price_group.toLowerCase().includes(value.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (group: string) => {
    onChange(group);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const showDropdown = isOpen && inputFocused && (filteredGroups.length > 0 || value.length === 0);

  return (
    <div className="relative">
      <div className="relative">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setInputFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => {
            setInputFocused(false);
            // Delay closing to allow click on suggestion
            setTimeout(() => setIsOpen(false), 200);
          }}
          placeholder={placeholder}
          className={cn("pl-9", className)}
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="p-3 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="p-3">
              <p className="text-sm text-muted-foreground">
                {value ? `No existing materials with group "${value}"` : 'No price groups in inventory yet'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You can create a new group by typing any name
              </p>
            </div>
          ) : (
            <>
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border bg-muted/50">
                Existing Price Groups in Inventory
              </div>
              {filteredGroups.map((group) => (
                <button
                  key={group.price_group}
                  onClick={() => handleSelect(group.price_group)}
                  className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {group.price_group}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {group.subcategories.slice(0, 2).join(', ')}
                      {group.subcategories.length > 2 && '...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Package className="h-3 w-3" />
                    {group.count} materials
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};
