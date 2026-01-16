import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Download, Trash2, X, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface BulkActionsBarProps {
  selectedCount: number;
  selectedWithEmailsCount: number;
  onStartCampaign: () => void;
  onExport: () => void;
  onClearSelection: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  isDeleting?: boolean;
}

export const BulkActionsBar = ({
  selectedCount,
  selectedWithEmailsCount,
  onStartCampaign,
  onExport,
  onClearSelection,
  onDelete,
  canDelete = false,
  isDeleting = false,
}: BulkActionsBarProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleConfirmDelete = () => {
    onDelete?.();
    setDeleteDialogOpen(false);
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-background border border-border shadow-lg rounded-lg px-4 py-3 flex items-center gap-4">
            {/* Selection Count */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <UserCheck className="h-3.5 w-3.5 mr-1" />
                {selectedCount} selected
              </Badge>
              {selectedWithEmailsCount < selectedCount && (
                <span className="text-xs text-muted-foreground">
                  ({selectedWithEmailsCount} with email)
                </span>
              )}
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={onStartCampaign}
                disabled={selectedWithEmailsCount === 0}
                className="bg-primary hover:bg-primary/90"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Campaign
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              {/* Delete Button */}
              {canDelete && onDelete && (
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedCount} Client{selectedCount > 1 ? 's' : ''}?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>
                          Are you sure you want to delete <strong>{selectedCount}</strong> selected client{selectedCount > 1 ? 's' : ''}?
                        </p>
                        <p className="text-destructive font-medium">
                          This action cannot be undone. All associated data will be permanently deleted.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleConfirmDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : `Delete ${selectedCount} Client${selectedCount > 1 ? 's' : ''}`}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Clear Selection */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
