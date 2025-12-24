import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Download, Tag, Trash2, X, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SelectedClient } from "@/hooks/useClientSelection";

interface BulkActionsBarProps {
  selectedCount: number;
  selectedWithEmailsCount: number;
  onStartCampaign: () => void;
  onExport: () => void;
  onClearSelection: () => void;
}

export const BulkActionsBar = ({
  selectedCount,
  selectedWithEmailsCount,
  onStartCampaign,
  onExport,
  onClearSelection,
}: BulkActionsBarProps) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
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
