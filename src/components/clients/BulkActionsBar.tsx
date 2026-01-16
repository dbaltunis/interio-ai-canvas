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
          className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-fit mx-auto"
        >
          <div className="bg-background border border-border shadow-lg rounded-lg px-3 py-2.5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 sm:px-4 sm:py-3">
            {/* Selection Count */}
            <Badge variant="secondary" className="bg-primary/10 text-primary whitespace-nowrap">
              <UserCheck className="h-3.5 w-3.5 mr-1" />
              {selectedCount}
            </Badge>

            <div className="hidden sm:block h-6 w-px bg-border" />

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
              <Button
                size="sm"
                onClick={onStartCampaign}
                disabled={selectedWithEmailsCount === 0}
                className="bg-primary hover:bg-primary/90 h-8 px-2.5 sm:px-3"
              >
                <Mail className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Email</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="h-8 px-2.5 sm:px-3"
              >
                <Download className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>

              {/* Delete Button */}
              {canDelete && onDelete && (
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive h-8 px-2.5 sm:px-3"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">Delete</span>
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

              {/* Clear Selection */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-muted-foreground hover:text-foreground h-8 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
