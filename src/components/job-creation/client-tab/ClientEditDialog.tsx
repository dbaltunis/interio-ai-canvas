
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ClientEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeClient: () => void;
  onCreateNew: () => void;
}

export const ClientEditDialog = ({
  open,
  onOpenChange,
  onChangeClient,
  onCreateNew
}: ClientEditDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Update client information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Client editing functionality will be implemented here. For now, you can change to a different client or create a new one.
          </p>
          <div className="flex space-x-2">
            <Button onClick={onChangeClient} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Change Client
            </Button>
            <Button onClick={onCreateNew} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
