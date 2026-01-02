
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FolderOpen, 
  Package, 
  Wrench,
  Calendar,
  Settings,
  Calculator,
  BookOpen,
  PlusCircle,
  ShoppingCart
} from "lucide-react";
import { useMaterialQueueCount } from "@/hooks/useMaterialQueueCount";
import { useHasPermission, useUserPermissions } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface MainNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Homepage", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderOpen, permission: "view_jobs" },
  { id: "job-editor", label: "Job Editor", icon: PlusCircle, permission: "create_jobs" },
  { id: "quotes", label: "Quote Builder", icon: FileText, permission: "view_jobs" },
  { id: "emails", label: "Emails", icon: BookOpen, permission: "view_emails" },
  { id: "workshop", label: "Work Orders", icon: Wrench, permission: "view_jobs" },
  { id: "inventory", label: "Product Library", icon: Package, permission: "view_inventory" },
  { id: "ordering-hub", label: "Ordering Hub", icon: ShoppingCart, badge: true, permission: "view_inventory" },
  { id: "calendar", label: "Calendar", icon: Calendar, permission: "view_calendar" },
  { id: "clients", label: "Clients", icon: Users, permission: "view_clients" },
  { id: "calculator", label: "Calculator", icon: Calculator },
  { id: "settings", label: "Settings", icon: Settings, permission: "view_settings" },
];

export const MainNav = ({ activeTab, onTabChange }: MainNavProps) => {
  const { data: queueCount } = useMaterialQueueCount();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Permission checks
  const canViewJobs = useHasPermission('view_jobs');
  const canCreateJobs = useHasPermission('create_jobs');
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewClients = useHasPermission('view_clients');
  const canViewSettings = useHasPermission('view_settings');
  
  // For inventory and emails, check explicit permissions like jobs and clients
  const { data: userRoleData } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-nav', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[MainNav] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });
  
  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;
  const hasViewInventoryPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_inventory'
  ) ?? false;
  const hasViewEmailsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_emails'
  ) ?? false;
  
  // Works like jobs and clients - check explicit permissions first
  const canViewInventory = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasViewInventoryPermission
        : hasViewInventoryPermission;

  const canViewEmails = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasViewEmailsPermission
        : hasViewEmailsPermission;
  
  // Filter nav items based on permissions (but keep emails visible, just disabled)
  // During loading (undefined), show items to prevent disappearing UI
  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true; // No permission required
    
    // Only hide if explicitly false, not undefined (loading)
    if (item.permission === 'view_jobs') return canViewJobs !== false;
    if (item.permission === 'create_jobs') return canCreateJobs !== false;
    if (item.permission === 'view_inventory') {
      // Wait for explicit permissions to load
      if (explicitPermissions === undefined && !userRoleData) return true; // Show during loading
      return canViewInventory;
    }
    // Keep emails tab visible but will be disabled
    if (item.permission === 'view_emails') return true;
    // Keep settings tab visible but will be disabled
    if (item.permission === 'view_settings') return true;
    if (item.permission === 'view_calendar') return canViewCalendar !== false;
    if (item.permission === 'view_clients') return canViewClients !== false;
    
    return true; // Default to showing during loading
  });
  
  return (
    <nav className="w-64 bg-background border-r border-border min-h-screen hidden lg:block">
      <div className="p-6">
        <div className="space-y-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const showBadge = item.badge && queueCount && queueCount > 0;
            
            // Check if emails tab should be disabled
            const isEmailsTab = item.id === 'emails';
            const isEmailsDisabled = isEmailsTab && explicitPermissions !== undefined && !permissionsLoading && !canViewEmails;
            
            // Check if settings tab should be disabled
            const isSettingsTab = item.id === 'settings';
            const isSettingsDisabled = isSettingsTab && canViewSettings === false && !permissionsLoading;
            
            const handleClick = () => {
              if (isEmailsDisabled) {
                toast({
                  title: "Permission Denied",
                  description: "You don't have permission to view emails.",
                  variant: "destructive",
                });
                return;
              }
              if (isSettingsDisabled) {
                toast({
                  title: "Permission Denied",
                  description: "You don't have permission to view settings.",
                  variant: "destructive",
                });
                return;
              }
              onTabChange(item.id);
            };
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start transition-all duration-200 text-sm font-medium relative",
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  (isEmailsDisabled || isSettingsDisabled) && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleClick}
                disabled={isEmailsDisabled || isSettingsDisabled}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
                {showBadge && (
                  <Badge 
                    variant="destructive" 
                    className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                  >
                    {queueCount}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
