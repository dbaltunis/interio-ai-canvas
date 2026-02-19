import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderOpen,
  Users,
  Home,
  Calendar,
  Plus,
  Package
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { CreateActionDialog } from "./CreateActionDialog";
import { useUserPresence } from "@/hooks/useUserPresence";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { TeamCollaborationCenter } from "../collaboration/TeamCollaborationCenter";
import { useMaterialQueueCount } from "@/hooks/useMaterialQueueCount";
import { useHasPermission } from "@/hooks/usePermissions";
import { useIsDealer } from "@/hooks/useIsDealer";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "projects", label: "Jobs", icon: FolderOpen, permission: "view_jobs" },
  { id: "clients", label: "Clients", icon: Users, permission: "view_clients" },
  { id: "calendar", label: "Calendar", icon: Calendar, permission: "view_calendar" },
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
  
  // Permission check using centralized hook
  const canViewSettings = useHasPermission('view_settings') !== false;
  // Check if user is a dealer - they have restricted navigation
  const { data: isDealer } = useIsDealer();
  
  // Check if ANY permission is still loading (undefined)
  const navPermissionsLoading = canViewJobs === undefined ||
                             canViewClients === undefined ||
                             canViewCalendar === undefined ||
                             canViewInventory === undefined;
  
  // Filter nav items based on permissions and dealer restrictions
  // During loading (undefined), show items to prevent disappearing UI
  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true;
    
    // Dealers: hide Calendar, show Library (they see Home, Jobs, Clients, Library)
    if (isDealer && item.id === 'calendar') return false;
    // Non-dealers: hide Library from bottom nav (accessible via sidebar/other means)
    if (!isDealer && item.id === 'inventory') return false;
    
    // Dealers always see Library regardless of permission
    if (isDealer && item.id === 'inventory') return true;
    
    // Dashboard/Home should always be visible for authenticated users
    if (item.permission === 'view_dashboard') return true;
    // Only hide if explicitly false, not undefined (loading)
    if (item.permission === 'view_jobs') return canViewJobs !== false;
    if (item.permission === 'view_clients') return canViewClients !== false;
    if (item.permission === 'view_calendar') return canViewCalendar !== false;
    if (item.permission === 'view_inventory') return canViewInventory !== false;
    
    return true; // Default to showing during loading
  });
  
  const otherActiveUsers = activeUsers.filter(user => user.user_id !== currentUser?.user_id && user.status === 'online');
  const unreadCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);
  const hasActivity = otherActiveUsers.length > 0 || unreadCount > 0;

  // Grid columns: items + 1 for center create button
  const gridCols = visibleNavItems.length >= 4 ? "grid-cols-5" :
                   visibleNavItems.length === 3 ? "grid-cols-4" :
                   visibleNavItems.length === 2 ? "grid-cols-3" : "grid-cols-2";

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-lg pb-safe pb-[env(safe-area-inset-bottom)]">
        {navPermissionsLoading ? (
          // Show skeleton while permissions are loading
          <div className="grid grid-cols-5 h-16">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-1 px-2">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        ) : (
          <div className={cn("relative grid min-h-[64px]", gridCols)}>
          {/* First half of items */}
          {visibleNavItems.slice(0, Math.ceil(visibleNavItems.length / 2)).map((item) => {
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
          {visibleNavItems.slice(Math.ceil(visibleNavItems.length / 2)).map((item) => {
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
