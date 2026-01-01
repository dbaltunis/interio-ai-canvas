import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Link2, Calendar as CalendarIcon, UserPlus, Settings as SettingsIcon, BarChart3, HelpCircle, ListTodo } from "lucide-react";
import { useGoogleCalendarIntegration, useGoogleCalendarSync } from "@/hooks/useGoogleCalendar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { CalendarFilters, CalendarFilterState } from "./CalendarFilters";
import { CalendarVisibilityFilter } from "./filters/CalendarVisibilityFilter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import { useTimezone } from "@/hooks/useTimezone";
import { TimezoneUtils } from "@/utils/timezoneUtils";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type CalendarView = 'month' | 'week' | 'day';

interface CalendarSyncToolbarProps {
  currentDate?: Date;
  view?: CalendarView;
  onTodayClick?: () => void;
  onPrevClick?: () => void;
  onNextClick?: () => void;
  onViewChange?: (view: CalendarView) => void;
  onFiltersChange?: (filters: CalendarFilterState) => void;
  onSchedulerClick?: () => void;
  onDateChange?: (date: Date) => void;
  onManageTemplates?: () => void;
  onViewBookings?: () => void;
  onViewAnalytics?: () => void;
  onTasksClick?: () => void;
  showTasksView?: boolean;
}

export const CalendarSyncToolbar = ({
  currentDate,
  view,
  onTodayClick,
  onPrevClick,
  onNextClick,
  onViewChange,
  onFiltersChange,
  onSchedulerClick,
  onDateChange,
  onManageTemplates,
  onViewBookings,
  onViewAnalytics,
  onTasksClick,
  showTasksView = false
}: CalendarSyncToolbarProps) => {
  const { integration, isConnected } = useGoogleCalendarIntegration();
  const { syncFromGoogle, syncAllToGoogle, isSyncingFromGoogle, isSyncingAll } = useGoogleCalendarSync();
  const isTablet = useIsTablet();
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  
  // Google Calendar sync toggle state
  const [googleSyncEnabled, setGoogleSyncEnabled] = useState(() => {
    const saved = localStorage.getItem('googleSyncEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save sync preference
  useEffect(() => {
    localStorage.setItem('googleSyncEnabled', JSON.stringify(googleSyncEnabled));
  }, [googleSyncEnabled]);

  // Handle sync toggle
  const handleSyncToggle = async (enabled: boolean) => {
    setGoogleSyncEnabled(enabled);
    if (enabled && isConnected) {
      // Import and export when enabling
      await syncFromGoogle();
      await syncAllToGoogle();
    }
  };

  // Auto-sync interval - every 5 minutes when enabled
  useEffect(() => {
    // Don't sync if not connected or sync is disabled
    if (!isConnected || !googleSyncEnabled) {
      return;
    }

    // Sync immediately on mount if needed
    const lastSyncTime = integration?.last_sync;
    const shouldSyncNow = !lastSyncTime || Date.now() - new Date(lastSyncTime).getTime() > 5 * 60 * 1000;
    
    if (shouldSyncNow) {
      console.log('Initial auto-sync triggered');
      syncFromGoogle();
      syncAllToGoogle();
    }

    // Set up interval for background sync every 5 minutes
    const interval = setInterval(() => {
      // Double-check connection before syncing
      if (isConnected && googleSyncEnabled) {
        console.log('Background auto-sync triggered');
        syncFromGoogle();
        syncAllToGoogle();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isConnected, googleSyncEnabled, integration?.last_sync, syncFromGoogle, syncAllToGoogle]);

  const isMobile = useIsMobile();
  const isDesktop = !isMobile && !isTablet;
  const { userTimezone, getCurrentOffset } = useTimezone();
  const { user } = useAuth();
  const { toast } = useToast();

  // Permission checks for creating appointments
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-calendar-toolbar', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[CalendarSyncToolbar] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  // Check if create_appointments is explicitly in user_permissions table
  const hasCreateAppointmentsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'create_appointments'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;

  // Only allow create if user is System Owner OR (Owner/Admin *without* explicit permissions) OR (explicit permissions include create_appointments)
  const canCreateAppointments =
    userRoleData?.isSystemOwner
      ? true
      : (isOwner || isAdmin)
          ? !hasAnyExplicitPermissions || hasCreateAppointmentsPermission
          : hasCreateAppointmentsPermission;

  // Handler for scheduler click with permission check
  const handleSchedulerClick = () => {
    const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;
    if (isPermissionLoaded && !canCreateAppointments) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create appointments.",
        variant: "destructive",
      });
      return;
    }
    // Don't allow creation while permissions are loading
    if (!isPermissionLoaded) {
      toast({
        title: "Loading",
        description: "Please wait while permissions are being checked...",
      });
      return;
    }
    onSchedulerClick?.();
  };

  // Format last sync time - shorter for mobile
  const getLastSyncText = () => {
    if (!integration?.last_sync) return 'Never';
    
    const secondsAgo = Math.floor((Date.now() - new Date(integration.last_sync).getTime()) / 1000);
    
    if (secondsAgo < 60) return 'Now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    return `${Math.floor(secondsAgo / 86400)}d ago`;
  };
  
  const lastSyncTime = getLastSyncText();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 flex-wrap">
      {/* Left section - Navigation controls */}
      {currentDate && view && onTodayClick && onPrevClick && onNextClick && (
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onTodayClick}
            className="h-7 text-xs"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevClick}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextClick}
            className="h-7 w-7"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isMobile && (
            <>
              <h2 className="text-sm md:text-base font-semibold ml-1">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground ml-2 cursor-help">
                      {getCurrentOffset(userTimezone)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{TimezoneUtils.getTimezoneDisplayName(userTimezone, true)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      )}

      {/* Google Calendar sync status (only if connected) */}
      {isConnected && (
        <div className="flex items-center gap-1.5">
          {integration?.active ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-destructive" />
          )}
          <span className="text-[11px] text-muted-foreground">
            {lastSyncTime}
          </span>
          {(isSyncingFromGoogle || isSyncingAll) && googleSyncEnabled && (
            <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Right section - Filters, View, and Sync controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Appointment Scheduling Dropdown - Desktop only */}
        {isDesktop && onSchedulerClick && onManageTemplates && onViewBookings && onViewAnalytics && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Appointment Scheduling</span>
                <span className="lg:hidden">Scheduling</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 pointer-events-auto !z-[99999] bg-popover"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  handleSchedulerClick();
                }}
                disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canCreateAppointments}
                className="pointer-events-auto cursor-pointer"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                New Booking Template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  onManageTemplates?.();
                }}
                className="pointer-events-auto cursor-pointer"
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                Manage Templates
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  onViewBookings?.();
                }}
                className="pointer-events-auto cursor-pointer"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                View Bookings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  onViewAnalytics?.();
                }}
                className="pointer-events-auto cursor-pointer"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Filters */}
        {onFiltersChange && (
          <>
            <CalendarVisibilityFilter />
            <CalendarFilters onFiltersChange={onFiltersChange} />
          </>
        )}

        {/* View selector - Moved directly under Filters to save space */}
        {view && onViewChange && (
          <Select value={view} onValueChange={onViewChange}>
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {!isTablet && <SelectItem value="month">Month</SelectItem>}
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Scheduler button - Tablets only */}
        {isTablet && onSchedulerClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSchedulerClick}
            disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canCreateAppointments}
            className="h-7 w-7 p-0"
            title="Booking Templates"
          >
            <Link2 className="h-4 w-4" />
          </Button>
        )}

        {/* Calendar picker - Desktop (week/day view) and Tablets */}
        {((isDesktop && view && view !== 'month') || isTablet) && currentDate && onDateChange && (
          <Popover open={showCalendarPicker} onOpenChange={setShowCalendarPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Pick a date"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background z-50" align="end">
              <div className="p-3 border-b bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  Today: <span className="font-medium text-foreground">{format(new Date(), 'MMM dd, yyyy')}</span>
                </p>
              </div>
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => {
                  if (date) {
                    onDateChange(date);
                    setShowCalendarPicker(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Tasks View Toggle */}
        {onTasksClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onTasksClick}
            className="h-7 px-3 gap-1.5"
          >
            {showTasksView ? (
              <>
                <CalendarIcon className="h-4 w-4" />
                <span className="text-xs">Calendar</span>
              </>
            ) : (
              <>
                <ListTodo className="h-4 w-4" />
                <span className="text-xs">Tasks</span>
              </>
            )}
          </Button>
        )}

        {/* Google Calendar sync toggle (only if connected) */}
        {isConnected && (
          <TooltipProvider>
            <div className="flex items-center gap-1.5">
              <Switch
                id="google-sync"
                checked={googleSyncEnabled}
                onCheckedChange={handleSyncToggle}
                disabled={isSyncingFromGoogle || isSyncingAll}
                className="scale-75"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="cursor-help">
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    <strong>Google Calendar Sync</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically imports and exports all events, appointments, and tasks between your calendar and Google Calendar every 5 minutes.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};
