
import React, { useState } from 'react';
import { BrandHeader } from './BrandHeader';
import { UserProfile } from './UserProfile';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
// Removed NotificationDropdown - simplified UI
import { TeamCollaborationCenter } from '../collaboration/TeamCollaborationCenter';
import { AINotificationToast } from '../collaboration/AINotificationToast';
import { Button } from '@/components/ui/button';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useMaterialQueueCount } from '@/hooks/useMaterialQueueCount';
import { useHasPermission } from '@/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FolderOpen, 
  Package, 
  Calendar,
  Menu,
  X,
  MessageCircle,
  ShoppingCart,
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard, tourId: "dashboard-tab" },
  { id: "projects", label: "Jobs", icon: FolderOpen, tourId: "projects-tab", permission: "view_jobs" },
  { id: "clients", label: "Clients", icon: Users, tourId: "clients-tab", permission: "view_clients" },
  { id: "quotes", label: "Emails", icon: FileText, tourId: "emails-tab", permission: "view_emails" },
  { id: "calendar", label: "Calendar", icon: Calendar, tourId: "calendar-tab", permission: "view_calendar" },
  { id: "inventory", label: "Library", icon: Package, tourId: "library-tab", permission: "view_inventory" },
  { id: "online-store", label: "Store", icon: Store, tourId: "online-store-tab", permission: "has_online_store" },
  { id: "ordering-hub", label: "Purchasing", icon: ShoppingCart, tourId: "ordering-hub-tab", badge: true, permission: "view_inventory" },
];

export const ResponsiveHeader = ({ activeTab, onTabChange }: ResponsiveHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [presencePanelOpen, setPresencePanelOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const { activeUsers, currentUser } = useUserPresence();
  const { conversations } = useDirectMessages();
  const { data: queueCount } = useMaterialQueueCount();
  
  // Permission checks - these return undefined while loading
  const canViewJobs = useHasPermission('view_jobs');
  const canViewClients = useHasPermission('view_clients');
  const canViewEmails = useHasPermission('view_emails');
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewInventory = useHasPermission('view_inventory');
  
  // Check if permissions are still loading
  const permissionsLoading = canViewJobs === undefined;
  
  // Check if user has InteriorApp store AND NOT using Shopify
  const { data: hasOnlineStore } = useQuery({
    queryKey: ['has-online-store-nav'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Check for InteriorApp store
      const { data: store } = await supabase
        .from('online_stores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Check for Shopify connection
      const { data: shopify } = await supabase
        .from('shopify_integrations')
        .select('id, is_connected')
        .eq('user_id', user.id)
        .eq('is_connected', true)
        .maybeSingle();
      
      const hasStore = !!store && !shopify?.is_connected;
      console.log('[ResponsiveHeader] Store nav check:', { hasStore: !!store, hasShopify: !!shopify, showNav: hasStore });
      return hasStore;
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });
  
  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true; // No permission required (dashboard)
    
    if (item.permission === 'view_jobs') return canViewJobs === true;
    if (item.permission === 'view_clients') return canViewClients === true;
    if (item.permission === 'view_emails') return canViewEmails === true;
    if (item.permission === 'view_calendar') return canViewCalendar === true;
    if (item.permission === 'view_inventory') return canViewInventory === true;
    if (item.permission === 'has_online_store') return hasOnlineStore === true;
    
    return false;
  });
  
  // Check if there are other active users or unread messages
  const otherActiveUsers = activeUsers.filter(user => user.user_id !== currentUser?.user_id && user.status === 'online');
  const unreadCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);
  const hasActivity = otherActiveUsers.length > 0 || unreadCount > 0;

  return (
    <>
      {/* Desktop Header - hidden on mobile/tablet, they use bottom nav */}
      <header className="sticky top-0 z-40 w-full border-b glass-morphism-strong hidden lg:block"
        data-tour-id="header-profile"
      >
        <div className="flex h-16 items-center justify-between px-6 max-w-full">
          {/* Left: Logo */}
          <div className="flex items-center">
            <BrandHeader size="xl" showTagline={true} />
          </div>

          {/* Center: Navigation items */}
          <nav className="flex items-center space-x-2 lg:space-x-3">
            {permissionsLoading ? (
              // Show skeleton while permissions are loading
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-9 w-24" />
                ))}
              </>
            ) : (
              visibleNavItems.map((item) => {
                const Icon = item.icon;
                const showBadge = item.badge && queueCount && queueCount > 0;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                      activeTab === item.id 
                        ? "bg-primary text-primary-foreground shadow-sm border border-primary/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                    data-tour-id={item.tourId}
                  >
                    <Icon className={cn(
                      "h-4 w-4 transition-transform",
                      activeTab === item.id && "scale-110"
                    )} />
                    <span className={cn(activeTab === item.id && "font-semibold")}>{item.label}</span>
                    {showBadge && (
                      <Badge 
                        variant="destructive" 
                        className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                      >
                        {queueCount}
                      </Badge>
                    )}
                  </button>
                );
              })
            )}
          </nav>
          {/* Right: User Profile */}
          <div className="flex items-center gap-3">
            <UserProfile
              onOpenTeamHub={() => setPresencePanelOpen(!presencePanelOpen)}
              showCollaborationIndicator={hasActivity}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Header - HIDDEN, using bottom nav instead */}
      {/* <header className="sticky top-0 z-40 w-full border-b glass-morphism-strong lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <BrandHeader size="md" showTagline={false} />
          <UserProfile 
            onOpenTeamHub={() => setPresencePanelOpen(!presencePanelOpen)}
            showCollaborationIndicator={hasActivity}
            unreadCount={unreadCount}
          />
        </div>
      </header> */}

      {/* Modern AI-style Team Collaboration */}
      <TeamCollaborationCenter 
        isOpen={presencePanelOpen}
        onToggle={() => setPresencePanelOpen(!presencePanelOpen)}
      />

      <AINotificationToast
        notifications={notifications}
        onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
        onAction={(id) => {
          // Handle notification action
          setMessageDialogOpen(true);
          setNotifications(prev => prev.filter(n => n.id !== id));
        }}
      />
    </>
  );
};
