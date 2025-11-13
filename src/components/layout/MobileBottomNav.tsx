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
  Store
} from "lucide-react";
import { useState } from "react";
import { CreateActionDialog } from "./CreateActionDialog";
import { UserProfile } from "./UserProfile";
import { useUserPresence } from "@/hooks/useUserPresence";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { TeamCollaborationCenter } from "../collaboration/TeamCollaborationCenter";
import { useMaterialQueueCount } from "@/hooks/useMaterialQueueCount";
import { useHasPermission } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Home", icon: Home, permission: "view_dashboard" },
  { id: "projects", label: "Jobs", icon: FolderOpen, permission: "view_jobs" },
  { id: "clients", label: "Clients", icon: Users, permission: "view_clients" },
  { id: "online-store", label: "Store", icon: Store, permission: "has_online_store" },
  { id: "calendar", label: "Calendar", icon: Calendar, permission: "view_calendar" },
];

export const MobileBottomNav = ({ activeTab, onTabChange }: MobileBottomNavProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [presencePanelOpen, setPresencePanelOpen] = useState(false);
  
  const { activeUsers, currentUser } = useUserPresence();
  const { conversations } = useDirectMessages();
  const { data: queueCount } = useMaterialQueueCount();
  
  // Permission checks - these return undefined while loading
  const canViewDashboard = useHasPermission('view_dashboard');
  const canViewJobs = useHasPermission('view_jobs');
  const canViewClients = useHasPermission('view_clients');
  const canViewCalendar = useHasPermission('view_calendar');
  
  // Check if permissions are still loading
  const permissionsLoading = canViewJobs === undefined;
  
  // Check if user actually has an online store (not just permission)
  const { data: hasOnlineStore } = useQuery({
    queryKey: ['has-online-store-nav'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data } = await supabase
        .from('online_stores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      console.log('[MobileBottomNav] Online store check:', { hasStore: !!data });
      return !!data;
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always', // Always refetch when component mounts
  });
  
  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true;
    
    // Dashboard/Home should always be visible for authenticated users
    if (item.permission === 'view_dashboard') return true;
    if (item.permission === 'view_jobs') return canViewJobs === true;
    if (item.permission === 'view_clients') return canViewClients === true;
    if (item.permission === 'view_calendar') return canViewCalendar === true;
    if (item.permission === 'has_online_store') return hasOnlineStore === true;
    
    return false;
  });
  
  const otherActiveUsers = activeUsers.filter(user => user.user_id !== currentUser?.user_id && user.status === 'online');
  const unreadCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);
  const hasActivity = otherActiveUsers.length > 0 || unreadCount > 0;

  // Calculate grid columns based on number of visible items
  const gridCols = visibleNavItems.length === 4 ? "grid-cols-5" : 
                   visibleNavItems.length === 3 ? "grid-cols-4" :
                   visibleNavItems.length === 2 ? "grid-cols-3" : "grid-cols-2";

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-lg pb-safe">
        {permissionsLoading ? (
          // Show skeleton while permissions are loading
          <div className="grid grid-cols-5 h-16">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-1 px-2">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-3 w-12" />
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
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "h-full rounded-none flex flex-col items-center justify-center gap-1 transition-all duration-200 relative",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn(
                  "transition-all duration-200",
                  isActive ? "h-6 w-6" : "h-5 w-5"
                )} />
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive ? "opacity-100 font-semibold" : "opacity-70"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-t-full" />
                )}
              </Button>
            );
          })}
          
          {/* Center Create Button - Clean primary color */}
          <div className="relative flex items-center justify-center">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="absolute -top-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 bg-primary hover:bg-primary/90 text-primary-foreground border-4 border-background"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Second half of items */}
          {visibleNavItems.slice(Math.floor(visibleNavItems.length / 2)).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "h-full rounded-none flex flex-col items-center justify-center gap-1 transition-all duration-200 relative",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn(
                  "transition-all duration-200",
                  isActive ? "h-6 w-6" : "h-5 w-5"
                )} />
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive ? "opacity-100 font-semibold" : "opacity-70"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-t-full" />
                )}
              </Button>
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
          // Navigate to settings - could open a settings route
          window.location.href = '/settings';
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
