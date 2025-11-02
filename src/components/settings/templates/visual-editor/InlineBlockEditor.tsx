import React, { useState } from 'react';
import { Plus, GripVertical, Trash2, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface InlineBlockEditorProps {
  block: any;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (field: string, value: any) => void;
  onDelete: () => void;
  onAddBlockBelow: (type: string) => void;
}

export const InlineBlockEditor = ({
  block,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onAddBlockBelow,
}: InlineBlockEditorProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const blockTypes = [
    { value: 'text', label: '📝 Text Block' },
    { value: 'products', label: '🛍️ Products Table' },
    { value: 'totals', label: '💰 Totals' },
    { value: 'signature', label: '✍️ Signature' },
    { value: 'spacer', label: '⬛ Spacer' },
  ];

  return (
    <div
      className={cn(
        'relative group transition-all',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Hover/Selected Controls */}
      {(isHovered || isSelected) && (
        <div className="absolute -left-12 top-0 flex flex-col gap-1 z-10">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 cursor-grab hover:bg-primary/10"
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Add Block Below Button */}
      {isHovered && (
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-6 rounded-full shadow-lg bg-background"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Block
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {blockTypes.map((type) => (
                <DropdownMenuItem
                  key={type.value}
                  onClick={() => onAddBlockBelow(type.value)}
                >
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Block Type Badge */}
      {isSelected && (
        <div className="absolute -top-3 left-4 z-10">
          <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-md shadow-sm">
            {block.type}
          </span>
        </div>
      )}
    </div>
  );
};
