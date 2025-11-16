import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, X, QrCode } from "lucide-react";
import { QRCodeLabelGenerator } from "./QRCodeLabelGenerator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface InventoryBulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  selectedItems?: any[];
}

export const InventoryBulkActionsBar = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  selectedItems = [],
}: InventoryBulkActionsBarProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLabelGenerator, setShowLabelGenerator] = useState(false);

  const handleDelete = () => {
    onBulkDelete();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{selectedCount} selected</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">Bulk Actions</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLabelGenerator(true)}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Print QR Labels
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} items?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected inventory items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <QRCodeLabelGenerator
        open={showLabelGenerator}
        onOpenChange={setShowLabelGenerator}
        items={selectedItems}
      />
    </>
  );
};
