import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, FileText } from "lucide-react";

interface NewQuoteVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicate: () => void;
  onStartFresh: () => void;
  isLoading?: boolean;
}

export const NewQuoteVersionDialog = ({
  open,
  onOpenChange,
  onDuplicate,
  onStartFresh,
  isLoading = false,
}: NewQuoteVersionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Quote Version</DialogTitle>
          <DialogDescription>
            Would you like to duplicate the current quote with all rooms and treatments, or start fresh?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <Button
            onClick={() => {
              onDuplicate();
              onOpenChange(false);
            }}
            disabled={isLoading}
            className="h-auto py-4 flex-col items-start text-left gap-2"
            variant="outline"
          >
            <div className="flex items-center gap-2 w-full">
              <Copy className="h-5 w-5 text-primary" />
              <span className="font-semibold">Duplicate Current Quote</span>
            </div>
            <p className="text-sm text-muted-foreground font-normal">
              Copy all rooms, treatments, and pricing from the current version
            </p>
          </Button>

          <Button
            onClick={() => {
              onStartFresh();
              onOpenChange(false);
            }}
            disabled={isLoading}
            className="h-auto py-4 flex-col items-start text-left gap-2"
            variant="outline"
          >
            <div className="flex items-center gap-2 w-full">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold">Start Fresh</span>
            </div>
            <p className="text-sm text-muted-foreground font-normal">
              Create a blank quote version without any rooms or treatments
            </p>
          </Button>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
