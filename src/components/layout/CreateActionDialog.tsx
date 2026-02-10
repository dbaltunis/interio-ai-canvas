import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, FolderOpen, Calendar, Plus, Settings, MessageCircle, Package } from "lucide-react";
import { useUserPermissions, useHasPermission } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useIsDealer } from "@/hooks/useIsDealer";
import { useMemo } from "react";

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
  const { user } = useAuth();
  const { isLoading: permissionsLoading } = useUserPermissions();
  const { data: userRoleData } = useUserRole();
  const { data: isDealer } = useIsDealer();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[CreateActionDialog] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });
  
  // Check if create_jobs is explicitly in user_permissions table (ignores role-based)
  const hasCreateJobsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'create_jobs'
  ) ?? false;
  
  // Check view_settings permission
  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;
  const hasViewSettingsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_settings'
  ) ?? false;
  
  // Permission checks for menu items
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewOwnCalendar = useHasPermission('view_own_calendar');
  const canViewInventory = useHasPermission('view_inventory');
  const canViewClients = useHasPermission('view_clients');
  const canViewJobs = useHasPermission('view_jobs');

  // Combined calendar permission
  const canAccessCalendar = canViewCalendar !== false || canViewOwnCalendar !== false;

  // Check if user has ANY main page permission (for smart menu visibility)
  const hasAnyMainPagePermission = useMemo(() => {
    if (userRoleData?.isSystemOwner) return true;
    if ((isOwner || isAdmin) && !hasAnyExplicitPermissions) return true;
    return canViewClients !== false ||
           canViewJobs !== false ||
           canViewCalendar !== false ||
           canViewOwnCalendar !== false ||
           canViewInventory !== false;
  }, [userRoleData, isOwner, isAdmin, hasAnyExplicitPermissions, canViewClients, canViewJobs, canViewCalendar, canViewOwnCalendar, canViewInventory]);
  
  const canViewSettings = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasViewSettingsPermission
        : hasViewSettingsPermission;
  
  const { toast } = useToast();
  
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
          
          {/* New Event - only if can view calendar */}
          {canAccessCalendar && (
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
  );
};
