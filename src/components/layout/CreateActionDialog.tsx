import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, FolderOpen, Calendar, Settings, MessageCircle, Package, Moon, Sun, LogOut } from "lucide-react";
import { useHasPermission } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { useIsDealer } from "@/hooks/useIsDealer";
import { useMemo, useState } from "react";
import { ClientFormWithLeadIntelligence } from "@/components/clients/ClientFormWithLeadIntelligence";
import { useCreateProject } from "@/hooks/useProjects";
import { useCreateQuote } from "@/hooks/useQuotes";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/auth/AuthProvider";

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
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Permission checks using centralized hook
  const hasCreateJobsPermission = useHasPermission('create_jobs') !== false;
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewOwnCalendar = useHasPermission('view_own_calendar');
  const canViewInventory = useHasPermission('view_inventory');
  const canViewClients = useHasPermission('view_clients');
  const canViewJobs = useHasPermission('view_jobs');
  const canViewSettings = useHasPermission('view_settings') !== false;
  const canViewTeam = useHasPermission('view_team_members') !== false;
  const canSendMessages = useHasPermission('send_team_messages') !== false;

  // Combined calendar permission
  const canAccessCalendar = canViewCalendar !== false || canViewOwnCalendar !== false;

  // Team & Messages visibility: not dealers AND has team or message permission
  const canAccessTeamMessages = !isDealer && (canViewTeam || canSendMessages);

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
  const createProject = useCreateProject();
  const createQuote = useCreateQuote();
  
  const handleCreateJob = async () => {
    if (!hasCreateJobsPermission) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to create jobs.",
        variant: "destructive",
      });
      return;
    }
    
    onOpenChange(false);
    
    try {
      const newProject = await createProject.mutateAsync({
        name: `New Job ${format(new Date(), 'MM/dd/yyyy')}`,
        description: "",
        status: "planning",
        client_id: null
      });

      await createQuote.mutateAsync({
        project_id: newProject.id,
        client_id: null,
        status: "draft",
        subtotal: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 0,
        notes: "New job created",
      });

      // Navigate to the new job
      navigate({ pathname: '/jobs', search: `?jobId=${newProject.id}` });
    } catch (error) {
      console.error("Failed to create new job:", error);
      toast({
        title: "Error",
        description: "Failed to create new job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAction = (action: string) => {
    onOpenChange(false);
    if (action === "client") {
      setShowClientCreate(true);
      return;
    } else if (action === "event") {
      onTabChange("calendar");
      setTimeout(() => {
        const createButton = document.querySelector('[data-create-event]') as HTMLElement;
        createButton?.click();
      }, 150);
    } else if (action === "library") {
      onTabChange("inventory");
    } else if (action === "settings") {
      onOpenSettings?.();
    } else if (action === "team") {
      onOpenTeamHub?.();
    }
  };

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    onOpenChange(false);
    await signOut();
    navigate('/auth');
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Quick Actions</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-3 py-2">
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
              onClick={handleCreateJob}
              variant="outline"
              className="h-16 justify-start gap-4 text-left"
              disabled={createProject.isPending || createQuote.isPending}
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
          
          {/* Team & Messages - hide for dealers AND requires team/message permissions */}
          {canAccessTeamMessages && (
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
          {canViewSettings && (
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

          {/* Separator before theme/logout */}
          <Separator className="my-1" />

          {/* Dark/Light Mode Toggle */}
          <Button
            onClick={handleToggleTheme}
            variant="outline"
            className="h-14 justify-start gap-4 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</div>
              <div className="text-xs text-muted-foreground">Switch appearance</div>
            </div>
          </Button>

          {/* Log Out */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="h-14 justify-start gap-4 text-left text-destructive hover:text-destructive"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
              <LogOut className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <div className="font-medium">Log Out</div>
              <div className="text-xs text-muted-foreground">Sign out of your account</div>
            </div>
          </Button>
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