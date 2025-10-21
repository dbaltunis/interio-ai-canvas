import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical, RotateCcw } from "lucide-react";
import { ColumnConfig } from "@/hooks/useColumnPreferences";
import { cn } from "@/lib/utils";

interface ColumnCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  onToggleColumn: (columnId: string) => void;
  onReorderColumns: (startIndex: number, endIndex: number) => void;
  onResetToDefaults: () => void;
}

export const ColumnCustomizationModal = ({
  isOpen,
  onClose,
  columns,
  onToggleColumn,
  onReorderColumns,
  onResetToDefaults,
}: ColumnCustomizationModalProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onReorderColumns(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleReset = () => {
    onResetToDefaults();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Customize Columns</DialogTitle>
          <DialogDescription>
            Select which columns to display and drag to reorder them
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-2">
            {columns.map((column, index) => (
              <div
                key={column.id}
                draggable={!column.locked}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border bg-background transition-all",
                  !column.locked && "cursor-move hover:border-primary",
                  draggedIndex === index && "opacity-50",
                  dragOverIndex === index && draggedIndex !== index && "border-primary border-2"
                )}
              >
                {!column.locked && (
                  <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                {column.locked && (
                  <div className="w-4" /> 
                )}
                
                <div className="flex items-center space-x-2 flex-1">
                  <Checkbox
                    id={column.id}
                    checked={column.visible}
                    onCheckedChange={() => onToggleColumn(column.id)}
                    disabled={column.locked}
                  />
                  <Label
                    htmlFor={column.id}
                    className={cn(
                      "text-sm font-medium cursor-pointer",
                      column.locked && "text-muted-foreground"
                    )}
                  >
                    {column.label}
                    {column.locked && (
                      <span className="ml-2 text-xs text-muted-foreground">(Required)</span>
                    )}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
