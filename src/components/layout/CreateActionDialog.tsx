import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, FolderOpen, Calendar, Plus, Settings, MessageCircle, ShoppingCart } from "lucide-react";

interface CreateActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTabChange: (tab: string) => void;
  queueCount?: number;
  onOpenSettings?: () => void;
  onOpenTeamHub?: () => void;
}

export const CreateActionDialog = ({ 
  open, 
  onOpenChange, 
  onTabChange,
  queueCount,
  onOpenSettings,
  onOpenTeamHub 
}: CreateActionDialogProps) => {
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
    } else if (action === "purchasing") {
      onTabChange("ordering-hub");
    } else if (action === "settings") {
      onOpenSettings?.();
    } else if (action === "team") {
      onOpenTeamHub?.();
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
          
          <Separator className="my-2" />
          
          <Button
            onClick={() => handleAction("purchasing")}
            variant="outline"
            className="h-16 justify-start gap-4 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 relative">
              <ShoppingCart className="h-5 w-5 text-primary" />
              {queueCount && queueCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[9px]"
                >
                  {queueCount}
                </Badge>
              )}
            </div>
            <div>
              <div className="font-semibold">Material Purchasing</div>
              <div className="text-sm text-muted-foreground">Manage orders & suppliers</div>
            </div>
          </Button>
          
          <Separator className="my-2" />
          
          <Button
            onClick={() => handleAction("team")}
            variant="outline"
            className="h-14 justify-start gap-4 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">Team & Messages</div>
              <div className="text-xs text-muted-foreground">Collaborate with your team</div>
            </div>
          </Button>
          
          <Button
            onClick={() => handleAction("settings")}
            variant="outline"
            className="h-14 justify-start gap-4 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-500/10">
              <Settings className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <div className="font-medium">Settings</div>
              <div className="text-xs text-muted-foreground">Account & preferences</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
