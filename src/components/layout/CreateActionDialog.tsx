import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, FolderOpen, Calendar, Plus, Settings, MessageCircle, Package } from "lucide-react";
import { useHasPermission } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { useIsDealer } from "@/hooks/useIsDealer";
import { useMemo, useState } from "react";
import { ClientFormWithLeadIntelligence } from "@/components/clients/ClientFormWithLeadIntelligence";

interface CreateActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTabChange: (tab: string) => void;
  queueCount?: number; // kept for API compatibility
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
  const { data: isDealer } = useIsDealer();

  // Permission checks using centralized hook
  const hasCreateJobsPermission = useHasPermission('create_jobs') !== false;
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewOwnCalendar = useHasPermission('view_own_calendar');
  const canViewInventory = useHasPermission('view_inventory');
  const canViewClients = useHasPermission('view_clients');
  const canViewJobs = useHasPermission('view_jobs');
  const canViewSettings = useHasPermission('view_settings') !== false;

  // Combined calendar permission
  const canAccessCalendar = canViewCalendar !== false || canViewOwnCalendar !== false;

  // Check if user has ANY main page permission (for smart menu visibility)
  const hasAnyMainPagePermission = useMemo(() => {
    return canViewClients !== false ||
           canViewJobs !== false ||
           canViewCalendar !== false ||
           canViewOwnCalendar !== false ||
           canViewInventory !== false;
  }, [canViewClients, canViewJobs, canViewCalendar, canViewOwnCalendar, canViewInventory]);
  
  const { toast } = useToast();
  const [showClientCreate, setShowClientCreate] = useState(false);
  
  const handleAction = (action: string) => {
    onOpenChange(false);
    // Navigate to the appropriate tab and trigger creation
    if (action === "client") {
      // Open inline client create dialog instead of navigating
      setShowClientCreate(true);
      return;
    } else if (action === "project") {
      // Check permission before triggering creation
      if (!hasCreateJobsPermission) {
        toast({
          title: "Permission Denied",
          description: "You do not have permission to create jobs.",
          variant: "destructive",
        });
        return;
      }
      onTabChange("projects");
      // Dispatch custom event for job creation (works on both mobile & desktop)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('create-new-job'));
      }, 150);
    } else if (action === "event") {
      onTabChange("calendar");
      setTimeout(() => {
        const createButton = document.querySelector('[data-create-event]') as HTMLElement;
        createButton?.click();
      }, 150);
    } else if (action === "library") {
      onTabChange("inventory");
    } else if (action === "settings") {
      if (canViewSettings === false) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to view settings.",
          variant: "destructive",
        });
        return;
      }
      onOpenSettings?.();
    } else if (action === "team") {
      onOpenTeamHub?.();
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create New
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          {/* New Client - always visible if user has any main page permission */}
          {hasAnyMainPagePermission && (
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
          )}
          
          {hasCreateJobsPermission && (
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
          )}
          
          {/* New Event - only if can view calendar AND not a dealer */}
          {canAccessCalendar && !isDealer && (
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
          )}
          
          {/* Browse Library - only if can view inventory */}
          {canViewInventory !== false && (
            <Button
              onClick={() => handleAction("library")}
              variant="outline"
              className="h-16 justify-start gap-4 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Browse Library</div>
                <div className="text-sm text-muted-foreground">View materials & inventory</div>
              </div>
            </Button>
          )}
          
          {/* Separator before utility items */}
          <Separator className="my-1" />
          
          {/* Team & Messages - hide for dealers (they have restricted team visibility) */}
          {!isDealer && (
            <Button
              onClick={() => handleAction("team")}
              variant="outline"
              className="h-14 justify-start gap-4 text-left"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10">
                <MessageCircle className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div>
                <div className="font-medium">Team & Messages</div>
                <div className="text-xs text-muted-foreground">Collaborate with your team</div>
              </div>
            </Button>
          )}
          
          {/* Settings - HIDE entirely if no permission */}
          {canViewSettings !== false && (
            <Button
              onClick={() => handleAction("settings")}
              variant="outline"
              className="h-14 justify-start gap-4 text-left"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium">Settings</div>
                <div className="text-xs text-muted-foreground">Account & preferences</div>
              </div>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Inline Client Create Dialog */}
    <Dialog open={showClientCreate} onOpenChange={setShowClientCreate}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <ClientFormWithLeadIntelligence 
          onCancel={() => setShowClientCreate(false)} 
          onSuccess={() => setShowClientCreate(false)} 
        />
      </DialogContent>
    </Dialog>
  </>
  );
};
