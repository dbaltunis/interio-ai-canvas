import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, FolderOpen, Calendar, Plus } from "lucide-react";

interface CreateActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTabChange: (tab: string) => void;
}

export const CreateActionDialog = ({ open, onOpenChange, onTabChange }: CreateActionDialogProps) => {
  const handleAction = (action: string) => {
    onOpenChange(false);
    // Navigate to the appropriate tab and trigger creation
    if (action === "client") {
      onTabChange("clients");
      // Trigger client creation dialog after a brief delay
      setTimeout(() => {
        const createButton = document.querySelector('[data-create-client]') as HTMLElement;
        createButton?.click();
      }, 150);
    } else if (action === "project") {
      onTabChange("projects");
      setTimeout(() => {
        const createButton = document.querySelector('[data-create-project]') as HTMLElement;
        createButton?.click();
      }, 150);
    } else if (action === "event") {
      onTabChange("calendar");
      setTimeout(() => {
        const createButton = document.querySelector('[data-create-event]') as HTMLElement;
        createButton?.click();
      }, 150);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create New
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          <Button
            onClick={() => handleAction("client")}
            variant="outline"
            className="h-16 justify-start gap-4 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">New Client</div>
              <div className="text-sm text-muted-foreground">Add a client to your CRM</div>
            </div>
          </Button>
          
          <Button
            onClick={() => handleAction("project")}
            variant="outline"
            className="h-16 justify-start gap-4 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">New Job</div>
              <div className="text-sm text-muted-foreground">Create a new project</div>
            </div>
          </Button>
          
          <Button
            onClick={() => handleAction("event")}
            variant="outline"
            className="h-16 justify-start gap-4 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">New Event</div>
              <div className="text-sm text-muted-foreground">Schedule a calendar event</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
