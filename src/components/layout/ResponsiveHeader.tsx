
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
import { useHasPermission, useUserPermissions } from '@/hooks/usePermissions';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsDealer } from '@/hooks/useIsDealer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// Hidden for now - TeachingHelpButton needs completion before deployment
// import { TeachingHelpButton } from '@/components/teaching/TeachingHelpButton';
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
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard, tourId: "dashboard-tab" },
  { id: "clients", label: "Clients", icon: Users, tourId: "crm-tab", permission: "view_clients" },
  { id: "projects", label: "Jobs", icon: FolderOpen, tourId: "projects-tab", permission: "view_jobs" },
  { id: "emails", label: "Emails", icon: FileText, tourId: "emails-tab", permission: "view_emails" },
  { id: "calendar", label: "Calendar", icon: Calendar, tourId: "calendar-tab", permission: "view_calendar" },
  { id: "inventory", label: "Library", icon: Package, tourId: "library-tab", permission: "view_inventory" },
  { id: "online-store", label: "Store", icon: Store, tourId: "online-store-tab", permission: "has_online_store" },
];

export const ResponsiveHeader = ({ activeTab, onTabChange }: ResponsiveHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [presencePanelOpen, setPresencePanelOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const { activeUsers, currentUser } = useUserPresence();
  const { conversations } = useDirectMessages();
  const { toast } = useToast();
  
  // Check if user is a dealer - they have restricted navigation
  const { data: isDealer } = useIsDealer();
  
  // Permission checks - these return undefined while loading
  const canViewJobs = useHasPermission('view_jobs');
  const canViewClients = useHasPermission('view_clients');
  const canViewCalendar = useHasPermission('view_calendar');
  
  // For inventory, check explicit permissions like jobs and clients
  const { data: userRoleData } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-inventory', userRoleData?.role],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', authUser.id);
      if (error) {
        console.error('[ResponsiveHeader] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!userRoleData && !permissionsLoading,
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
  
  // Check if ANY permission is still loading (undefined)
  // Only show skeleton when truly loading, not when permissions are determined
  const permissionsLoadingState = canViewJobs === undefined || 
                             canViewClients === undefined || 
                             canViewCalendar === undefined || 
                             (explicitPermissions === undefined && !userRoleData);
  
  // Check if user has InteriorApp store AND NOT using Shopify
  const { data: hasOnlineStore } = useQuery({
    queryKey: ['has-online-store-nav'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Check for InteriorApp store
      const { data: store, error: storeError } = await supabase
        .from('online_stores')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (storeError) {
        console.error('[ResponsiveHeader] Error fetching store:', storeError);
        return false;
      }
      
      // Check for Shopify connection
      const { data: shopify } = await supabase
        .from('shopify_integrations')
        .select('id, is_connected')
        .eq('user_id', user.id)
        .eq('is_connected', true)
        .maybeSingle();
      
      const hasStore = store && store.length > 0 && !shopify?.is_connected;
      console.log('[ResponsiveHeader] Store nav check:', { hasStore: !!store, hasShopify: !!shopify, showNav: hasStore });
      return hasStore;
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Check if user has email provider configured (SendGrid OR Resend)
  const { data: hasEmailsConfigured } = useQuery({
    queryKey: ['has-emails-configured'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Get account owner to check account-level integrations
      const { data: accountOwnerId } = await supabase.rpc('get_account_owner', { 
        user_id_param: user.id 
      });

      // Check for SendGrid OR Resend integration
      const { data: integrations } = await supabase
        .from('integration_settings')
        .select('active, configuration, integration_type')
        .eq('account_owner_id', accountOwnerId || user.id)
        .in('integration_type', ['sendgrid', 'resend'])
        .eq('active', true);

      // Check if any email provider has a valid API key
      const hasValidProvider = integrations?.some(integration => {
        const config = integration.configuration as { api_key?: string } | null;
        return config?.api_key && config.api_key.trim().length > 0;
      });
      
      return !!hasValidProvider;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // Filter nav items based on permissions (but keep emails visible, just disabled)
  // During loading (undefined), show items to prevent disappearing UI
  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true; // No permission required (dashboard)
    
    // Dealers: hide Messages and Calendar
    if (isDealer) {
      if (item.id === 'emails') return false; // Hide Messages for dealers
      if (item.id === 'calendar') return false; // Hide Calendar for dealers
    }
    
    // Only hide if explicitly false, not undefined (loading)
    if (item.permission === 'view_jobs') return canViewJobs !== false;
    if (item.permission === 'view_clients') return canViewClients !== false;
    if (item.permission === 'view_calendar') return canViewCalendar !== false;
    if (item.permission === 'view_inventory') {
      // Wait for explicit permissions to load
      if (explicitPermissions === undefined && !userRoleData) return true; // Show during loading
      return canViewInventory;
    }
    // Keep emails tab visible but will be disabled
    if (item.permission === 'view_emails') return true;
    if (item.permission === 'has_online_store') return hasOnlineStore === true;
    
    return true; // Default to showing during loading
  });
  
  // Check if there are other active users or unread messages
  const otherActiveUsers = activeUsers.filter(user => user.user_id !== currentUser?.user_id && user.status === 'online');
  const unreadCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);
  const hasActivity = otherActiveUsers.length > 0 || unreadCount > 0;

  return (
    <>
      {/* Desktop Header - hidden on mobile/tablet, they use bottom nav */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur-md shadow-xs hidden lg:block"
        data-tour-id="header-profile"
      >
        <div className="flex h-14 items-center justify-between px-6 max-w-full">
          {/* Left: Logo */}
          <div className="flex items-center">
            <BrandHeader size="xl" showTagline={true} />
          </div>

          {/* Center: Navigation items */}
          <nav className="flex items-center space-x-2 lg:space-x-3">
            {permissionsLoadingState ? (
              // Show skeleton while permissions are loading
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-9 w-20 rounded-lg" />
                ))}
              </>
            ) : (
              visibleNavItems.map((item) => {
                const Icon = item.icon;
                
                // Check if emails tab should be disabled
                const isEmailsTab = item.id === 'emails';
                // Owners/Admins always have access to emails tab (they can configure providers from there)
                const isOwnerOrAdmin = userRoleData?.isOwner || userRoleData?.isSystemOwner || userRoleData?.isAdmin;
                const isEmailsDisabled = isEmailsTab && !isOwnerOrAdmin && explicitPermissions !== undefined && !permissionsLoading && !canViewEmails;
                // Only check email configuration for non-owners/admins
                const isEmailsNotConfigured = isEmailsTab && !isOwnerOrAdmin && hasEmailsConfigured === false && hasEmailsConfigured !== undefined;
                const shouldDisableEmails = isEmailsDisabled || isEmailsNotConfigured;
                
                const handleClick = () => {
                  if (isEmailsDisabled) {
                    toast({
                      title: "Permission Denied",
                      description: "You don't have permission to view emails.",
                      variant: "destructive",
                    });
                    return;
                  }
                  if (isEmailsNotConfigured) {
                    toast({
                      title: "Emails Not Configured",
                      description: "Please configure SendGrid integration to access emails.",
                      variant: "destructive",
                    });
                    return;
                  }
                  onTabChange(item.id);
                };
                
                return (
                  <button
                    key={item.id}
                    onClick={handleClick}
                    disabled={shouldDisableEmails}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                      activeTab === item.id 
                        ? "bg-primary text-primary-foreground shadow-sm border border-primary/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      shouldDisableEmails && "opacity-50 cursor-not-allowed"
                    )}
                    data-tour-id={item.tourId}
                  >
                    <Icon className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      activeTab === item.id && "scale-105"
                    )} />
                    <span>{item.label}</span>
                  </button>
                );
              })
            )}
          </nav>
          {/* Right: Tips + User Profile */}
          <div className="flex items-center gap-2">
            {/* Hidden for now - TeachingHelpButton needs completion */}
            {/* <TeachingHelpButton /> */}
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
