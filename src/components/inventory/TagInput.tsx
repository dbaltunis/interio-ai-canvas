import { useState, useMemo, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllTags, getTagsForSubcategory, TagCategory } from "@/constants/inventoryTags";
import { useInventoryTags } from "@/hooks/useInventoryTags";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  subcategory?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showSuggestions?: boolean;
}

export const TagInput = ({
  value = [],
  onChange,
  subcategory,
  placeholder = "Add tags...",
  className,
  disabled = false,
  showSuggestions = true,
}: TagInputProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get existing tags from database for autocomplete
  const { data: existingTags = [] } = useInventoryTags();
  
  // Get suggested tags for this subcategory
  const subcategoryTags = useMemo(() => {
    return subcategory ? getTagsForSubcategory(subcategory) : getAllTags();
  }, [subcategory]);
  
  // Combine predefined and existing tags for suggestions
  const allSuggestions = useMemo(() => {
    const predefinedKeys = subcategoryTags.map(t => t.key);
    const combined = [...predefinedKeys];
    
    // Add existing tags that aren't in predefined list
    existingTags.forEach(tag => {
      if (!combined.includes(tag)) {
        combined.push(tag);
      }
    });
    
    return combined;
  }, [subcategoryTags, existingTags]);
  
  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!inputValue) return allSuggestions.filter(s => !value.includes(s));
    
    const search = inputValue.toLowerCase();
    return allSuggestions.filter(
      tag => tag.toLowerCase().includes(search) && !value.includes(tag)
    );
  }, [inputValue, allSuggestions, value]);
  
  // Get tag display info
  const getTagInfo = (tagKey: string): TagCategory | undefined => {
    return subcategoryTags.find(t => t.key === tagKey);
  };
  
  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim().replace(/\s+/g, '_');
    if (normalizedTag && !value.includes(normalizedTag)) {
      onChange([...value, normalizedTag]);
    }
    setInputValue("");
    setOpen(false);
    inputRef.current?.focus();
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      handleRemoveTag(value[value.length - 1]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Current tags display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(tag => {
            const tagInfo = getTagInfo(tag);
            return (
              <Badge
                key={tag}
                variant="secondary"
                className={cn(
                  "gap-1 pr-1 text-xs",
                  tagInfo?.color || "bg-muted"
                )}
              >
                {tagInfo?.label || tag.replace(/_/g, ' ')}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 rounded-full p-0.5 hover:bg-background/50 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            );
          })}
        </div>
      )}
      
      {/* Tag input with autocomplete */}
      {!disabled && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (!open) setOpen(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                className="pl-9 pr-10"
              />
              {inputValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddTag(inputValue)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[var(--radix-popover-trigger-width)] p-0 z-[10001]" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandList>
                {filteredSuggestions.length === 0 && !inputValue ? (
                  <CommandEmpty>No suggestions available</CommandEmpty>
                ) : filteredSuggestions.length === 0 && inputValue ? (
                  <CommandEmpty>
                    Press Enter to add "{inputValue}"
                  </CommandEmpty>
                ) : (
                  <CommandGroup heading="Suggestions">
                    {filteredSuggestions.slice(0, 10).map(tag => {
                      const tagInfo = getTagInfo(tag);
                      return (
                        <CommandItem
                          key={tag}
                          value={tag}
                          onSelect={() => handleAddTag(tag)}
                          className="cursor-pointer"
                        >
                          <Badge
                            variant="secondary"
                            className={cn("text-xs", tagInfo?.color || "bg-muted")}
                          >
                            {tagInfo?.label || tag.replace(/_/g, ' ')}
                          </Badge>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
      
      {/* Quick add buttons for common tags */}
      {showSuggestions && !disabled && subcategoryTags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {subcategoryTags
            .filter(tag => !value.includes(tag.key))
            .slice(0, 6)
            .map(tag => (
              <Badge
                key={tag.key}
                variant="outline"
                className={cn(
                  "cursor-pointer text-xs hover:bg-accent transition-colors",
                  tag.color?.replace('bg-', 'hover:bg-').split(' ')[0]
                )}
                onClick={() => handleAddTag(tag.key)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {tag.label}
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
};
