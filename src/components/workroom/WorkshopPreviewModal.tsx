import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkshopPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  onDownloadPDF: () => void;
  onPrint: () => void;
  isGenerating?: boolean;
}

export const WorkshopPreviewModal = ({
  open,
  onOpenChange,
  children,
  onDownloadPDF,
  onPrint,
  isGenerating = false,
}: WorkshopPreviewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Workshop Document Preview</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadPDF}
                disabled={isGenerating}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onPrint}
                disabled={isGenerating}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 w-full">
          <div className="p-4 bg-muted/30 rounded-lg">
            {children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
