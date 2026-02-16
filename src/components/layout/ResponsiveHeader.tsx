
import React, { useState } from 'react';
import { BrandHeader } from './BrandHeader';
import { UserProfile } from './UserProfile';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { TeamCollaborationCenter } from '../collaboration/TeamCollaborationCenter';
import { AINotificationToast } from '../collaboration/AINotificationToast';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useNotifications } from '@/hooks/useNotifications';
import { useHasPermission } from '@/hooks/usePermissions';
import { useIsDealer } from '@/hooks/useIsDealer';
import { useToast } from '@/hooks/use-toast';
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
  Store,
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info
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
  { id: "emails", label: "Messages", icon: FileText, tourId: "emails-tab", permission: "view_emails" },
  { id: "calendar", label: "Calendar", icon: Calendar, tourId: "calendar-tab", permission: "view_calendar" },
  { id: "inventory", label: "Library", icon: Package, tourId: "library-tab", permission: "view_inventory" },
  { id: "online-store", label: "Store", icon: Store, tourId: "online-store-tab", permission: "has_online_store" },
];

function formatNotifTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export const ResponsiveHeader = ({ activeTab, onTabChange }: ResponsiveHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [presencePanelOpen, setPresencePanelOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [toastNotifications, setToastNotifications] = useState<any[]>([]);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);

  const { activeUsers, currentUser } = useUserPresence();
  const { conversations } = useDirectMessages();
  const { toast } = useToast();
  const {
    notifications: appNotifications,
    unreadCount: notifUnreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll: clearAllNotifications,
  } = useNotifications();
  
  // Check if user is a dealer - they have restricted navigation
  const { data: isDealer } = useIsDealer();
  
  // Permission checks using centralized hook - returns undefined while loading
  const canViewJobs = useHasPermission('view_jobs');
  const canViewClients = useHasPermission('view_clients');
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewInventory = useHasPermission('view_inventory');
  const canViewEmails = useHasPermission('view_emails');

  // Check if ANY permission is still loading (undefined)
  const permissionsLoadingState = canViewJobs === undefined ||
                             canViewClients === undefined ||
                             canViewCalendar === undefined;
  
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
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes - store status doesn't change often
    refetchOnMount: false,
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
    if (item.permission === 'view_inventory') return canViewInventory !== false;
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
                const isEmailsDisabled = isEmailsTab && canViewEmails === false;
                // Only check email configuration for non-owners/admins
                const shouldDisableEmails = isEmailsDisabled;
                
                const handleClick = () => {
                  if (isEmailsDisabled) {
                    toast({
                      title: "Permission Denied",
                      description: "You don't have permission to view emails.",
                      variant: "destructive",
                    });
                    return;
                  }
                  // Messages tab is now always accessible if user has permission
                  // Email provider config prompt is shown inside the Messages tab itself
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
          {/* Right: Notifications + User Profile */}
          <div className="flex items-center gap-2">
            <Popover open={notifPopoverOpen} onOpenChange={setNotifPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Bell className="h-4 w-4" />
                  {notifUnreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                      {notifUnreadCount > 9 ? '9+' : notifUnreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-96 p-0"
                sideOffset={8}
              >
                <div className="p-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span className="font-semibold text-sm">Notifications</span>
                      {notifUnreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          {notifUnreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {notifUnreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAllAsRead()}
                          className="text-xs h-7"
                        >
                          Mark all read
                        </Button>
                      )}
                      {appNotifications.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearAllNotifications()}
                          className="text-xs h-7 text-muted-foreground"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {appNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {appNotifications.map((notif) => {
                        const iconMap: Record<string, React.ElementType> = {
                          info: Info,
                          success: CheckCircle,
                          warning: AlertTriangle,
                          error: AlertTriangle,
                        };
                        const NotifIcon = iconMap[notif.type || 'info'] || Info;
                        return (
                          <div
                            key={notif.id}
                            className={cn(
                              'flex items-start gap-3 px-3 py-2.5 hover:bg-accent/50 cursor-pointer transition-colors',
                              !notif.read && 'bg-primary/5'
                            )}
                            onClick={() => {
                              markAsRead(notif.id);
                              if (notif.action_url) {
                                try {
                                  const url = new URL(notif.action_url, window.location.origin);
                                  const params = Object.fromEntries(url.searchParams.entries());
                                  
                                  // Determine target tab from explicit ?tab= or infer from path/params
                                  let tab = params.tab;
                                  delete params.tab;
                                  
                                  // Legacy support: infer tab from jobId param or path
                                  if (!tab) {
                                    if (params.jobId) tab = 'projects';
                                    else if (params.clientId) tab = 'clients';
                                    else if (params.eventId) tab = 'calendar';
                                    else if (url.pathname === '/calendar') tab = 'calendar';
                                    else if (url.pathname === '/clients') tab = 'clients';
                                    else if (url.pathname === '/projects') tab = 'projects';
                                  }
                                  
                                  if (tab) {
                                    onTabChange(tab);
                                    // Preserve deep-link params (jobId, eventId, clientId, etc.)
                                    setTimeout(() => {
                                      const currentParams = new URLSearchParams(window.location.search);
                                      currentParams.set('tab', tab!);
                                      Object.entries(params).forEach(([k, v]) => currentParams.set(k, v));
                                      window.history.replaceState(null, '', `?${currentParams.toString()}`);
                                      window.dispatchEvent(new PopStateEvent('popstate'));
                                    }, 50);
                                  }
                                } catch {
                                  onTabChange(notif.action_url.replace('/?tab=', ''));
                                }
                                setNotifPopoverOpen(false);
                              }
                            }}
                          >
                            <div className={cn(
                              'mt-0.5 p-1.5 rounded-md shrink-0',
                              notif.type === 'success' && 'bg-green-500/10 text-green-600',
                              notif.type === 'warning' && 'bg-amber-500/10 text-amber-600',
                              notif.type === 'error' && 'bg-red-500/10 text-red-600',
                              (!notif.type || notif.type === 'info') && 'bg-blue-500/10 text-blue-600',
                            )}>
                              <NotifIcon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight">{notif.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground/60" />
                                <span className="text-[10px] text-muted-foreground/60">
                                  {formatNotifTime(notif.created_at)}
                                </span>
                                {!notif.read && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 shrink-0 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notif.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
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
        notifications={toastNotifications}
        onDismiss={(id) => setToastNotifications(prev => prev.filter(n => n.id !== id))}
        onAction={(id) => {
          setMessageDialogOpen(true);
          setToastNotifications(prev => prev.filter(n => n.id !== id));
        }}
      />
    </>
  );
};
