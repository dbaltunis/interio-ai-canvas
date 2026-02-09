import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderOpen, 
  Users, 
  Home,
  Calendar,
  Plus,
  UserCircle,
  ShoppingCart,
  Store,
  CheckCircle2,
  Package
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { CreateActionDialog } from "./CreateActionDialog";
import { UserProfile } from "./UserProfile";
import { useUserPresence } from "@/hooks/useUserPresence";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { TeamCollaborationCenter } from "../collaboration/TeamCollaborationCenter";
import { useMaterialQueueCount } from "@/hooks/useMaterialQueueCount";
import { useHasPermission, useUserPermissions } from "@/hooks/usePermissions";
import { useIsDealer } from "@/hooks/useIsDealer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "projects", label: "Jobs", icon: FolderOpen, permission: "view_jobs" },
  { id: "calendar", label: "Calendar", icon: Calendar, permission: "view_calendar" },
  { id: "clients", label: "Clients", icon: Users, permission: "view_clients" },
  { id: "inventory", label: "Library", icon: Package, permission: "view_inventory" },
];

export const MobileBottomNav = ({ activeTab, onTabChange }: MobileBottomNavProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [presencePanelOpen, setPresencePanelOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { activeUsers, currentUser } = useUserPresence();
  const { conversations } = useDirectMessages();
  const { data: queueCount } = useMaterialQueueCount();
  
  // Permission checks - these return undefined while loading
  const canViewJobs = useHasPermission('view_jobs');
  const canViewClients = useHasPermission('view_clients');
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewInventory = useHasPermission('view_inventory');
  
  // Check view_settings permission
  const { data: userRoleData } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  const { isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-mobile', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[MobileBottomNav] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });
  
  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;
  const hasViewSettingsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'view_settings'
  ) ?? false;
  
  const canViewSettings = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
        ? !hasAnyExplicitPermissions || hasViewSettingsPermission
        : hasViewSettingsPermission;
  // Check if user is a dealer - they have restricted navigation
  const { data: isDealer } = useIsDealer();
  
  // Check if ANY permission is still loading (undefined)
  // Only show skeleton when truly loading, not when permissions are determined
  const navPermissionsLoading = canViewJobs === undefined || 
                             canViewClients === undefined || 
                             canViewCalendar === undefined ||
                             canViewInventory === undefined;
  
  // Check if user actually has an online store (not just permission)
  const { data: hasOnlineStore } = useQuery({
    queryKey: ['has-online-store-nav'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data, error } = await supabase
        .from('online_stores')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (error) {
        console.error('[MobileBottomNav] Error fetching store:', error);
        return false;
      }
      
      console.log('[MobileBottomNav] Online store check:', { hasStore: data && data.length > 0 });
      return data && data.length > 0;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes - store status changes rarely
    refetchOnMount: false, // Use cached data
  });
  
  // Filter nav items based on permissions and dealer restrictions
  // During loading (undefined), show items to prevent disappearing UI
  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true;
    
    // Dealers: hide Calendar (they only see Home, Jobs, Clients, Library)
    if (isDealer && item.id === 'calendar') return false;
    
    // Dashboard/Home should always be visible for authenticated users
    if (item.permission === 'view_dashboard') return true;
    // Only hide if explicitly false, not undefined (loading)
    if (item.permission === 'view_jobs') return canViewJobs !== false;
    if (item.permission === 'view_clients') return canViewClients !== false;
    if (item.permission === 'view_calendar') return canViewCalendar !== false;
    if (item.permission === 'view_inventory') return canViewInventory !== false;
    if (item.permission === 'has_online_store') return hasOnlineStore === true;
    
    return true; // Default to showing during loading
  });
  
  const otherActiveUsers = activeUsers.filter(user => user.user_id !== currentUser?.user_id && user.status === 'online');
  const unreadCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);
  const hasActivity = otherActiveUsers.length > 0 || unreadCount > 0;

  // Calculate grid columns based on number of visible items (+ 1 for center create button)
  const gridCols = visibleNavItems.length === 5 ? "grid-cols-6" :
                   visibleNavItems.length === 4 ? "grid-cols-5" :
                   visibleNavItems.length === 3 ? "grid-cols-4" :
                   visibleNavItems.length === 2 ? "grid-cols-3" : "grid-cols-2";

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-lg pb-safe">
        {navPermissionsLoading ? (
          // Show skeleton while permissions are loading
          <div className="grid grid-cols-6 h-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-1 px-2">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        ) : (
          <div className={cn("relative grid h-16", gridCols)}>
          {/* First half of items */}
          {visibleNavItems.slice(0, Math.floor(visibleNavItems.length / 2)).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="h-full"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "h-full w-full rounded-none flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative",
                    "active:bg-primary/10",
                    isActive 
                      ? "text-primary bg-primary/5" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className={cn(
                    "transition-all duration-200",
                    isActive ? "h-5 w-5" : "h-5 w-5"
                  )} />
                  <span className={cn(
                    "text-[10px] font-medium transition-all duration-200",
                    isActive ? "opacity-100 font-semibold" : "opacity-70"
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
                  )}
                </Button>
              </motion.div>
            );
          })}
          
          {/* Center Create Button - Clean primary color */}
          <div className="relative flex items-center justify-center">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="absolute -top-5 h-12 w-12 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-background"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Second half of items */}
          {visibleNavItems.slice(Math.floor(visibleNavItems.length / 2)).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="h-full"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "h-full w-full rounded-none flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative",
                    "active:bg-primary/10",
                    isActive 
                      ? "text-primary bg-primary/5" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className={cn(
                    "transition-all duration-200",
                    isActive ? "h-5 w-5" : "h-5 w-5"
                  )} />
                  <span className={cn(
                    "text-[10px] font-medium transition-all duration-200",
                    isActive ? "opacity-100 font-semibold" : "opacity-70"
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
        )}
      </nav>
      
      <CreateActionDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onTabChange={onTabChange}
        queueCount={queueCount}
          onOpenSettings={() => {
            if (canViewSettings === false) {
              toast({
                title: "Permission Denied",
                description: "You don't have permission to view settings.",
                variant: "destructive",
              });
              return;
            }
            // Navigate to settings using SPA navigation instead of hard reload
            onTabChange('settings');
          }}
        onOpenTeamHub={() => setPresencePanelOpen(true)}
      />
      
      <TeamCollaborationCenter 
        isOpen={presencePanelOpen}
        onToggle={() => setPresencePanelOpen(!presencePanelOpen)}
      />
    </>
  );
};
