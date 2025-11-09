import { Button } from "@/components/ui/button";
import { Eye, EyeOff, X } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onMakeVisible: () => void;
  onMakeHidden: () => void;
  onClearSelection: () => void;
}

export const BulkActionsBar = ({
  selectedCount,
  onMakeVisible,
  onMakeHidden,
  onClearSelection,
}: BulkActionsBarProps) => {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{selectedCount} selected</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">Bulk Actions</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onMakeVisible}>
            <Eye className="h-4 w-4 mr-2" />
            Make Visible
          </Button>
          <Button variant="outline" size="sm" onClick={onMakeHidden}>
            <EyeOff className="h-4 w-4 mr-2" />
            Hide
          </Button>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};
