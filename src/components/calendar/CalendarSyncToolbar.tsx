import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Settings as SettingsIcon, BarChart3, Search, Eye, MoreHorizontal } from "lucide-react";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";
import { Input } from "@/components/ui/input";
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
  const [showSearch, setShowSearch] = useState(false);
  
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
      await syncFromGoogle();
      await syncAllToGoogle();
    }
  };

  // Auto-sync interval - every 5 minutes when enabled
  useEffect(() => {
    if (!isConnected || !googleSyncEnabled) {
      return;
    }

    const lastSyncTime = integration?.last_sync;
    const shouldSyncNow = !lastSyncTime || Date.now() - new Date(lastSyncTime).getTime() > 5 * 60 * 1000;
    
    if (shouldSyncNow) {
      console.log('Initial auto-sync triggered');
      syncFromGoogle();
      syncAllToGoogle();
    }

    const interval = setInterval(() => {
      if (isConnected && googleSyncEnabled) {
        console.log('Background auto-sync triggered');
        syncFromGoogle();
        syncAllToGoogle();
      }
    }, 5 * 60 * 1000);

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

  const hasCreateAppointmentsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'create_appointments'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;

  const canCreateAppointments =
    userRoleData?.isSystemOwner
      ? true
      : (isOwner || isAdmin)
          ? !hasAnyExplicitPermissions || hasCreateAppointmentsPermission
          : hasCreateAppointmentsPermission;

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
    if (!isPermissionLoaded) {
      toast({
        title: "Loading",
        description: "Please wait while permissions are being checked...",
      });
      return;
    }
    onSchedulerClick?.();
  };

  const getLastSyncText = () => {
    if (!integration?.last_sync) return 'Never';
    
    const secondsAgo = Math.floor((Date.now() - new Date(integration.last_sync).getTime()) / 1000);
    
    if (secondsAgo < 60) return 'Now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h`;
    return `${Math.floor(secondsAgo / 86400)}d`;
  };
  
  const lastSyncTime = getLastSyncText();

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left section - Navigation */}
      {currentDate && view && onTodayClick && onPrevClick && onNextClick && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTodayClick}
            className="h-7 px-2 text-xs font-medium"
          >
            Today
          </Button>
          
          <div className="flex items-center">
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
          </div>
          
          <h2 className="text-sm font-semibold ml-1 min-w-[120px]">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          {/* Sync status indicator - minimal */}
          {isConnected && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 ml-2">
                    {integration?.active ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-destructive" />
                    )}
                    {(isSyncingFromGoogle || isSyncingAll) && googleSyncEnabled && (
                      <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p>Google Calendar: {lastSyncTime}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Right section - Actions */}
      <div className="flex items-center gap-1">
        {/* Search - expandable */}
        {onFiltersChange && (
          <>
            {showSearch ? (
              <div className="relative w-40 animate-in slide-in-from-right-2 duration-200">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
                <Input
                  placeholder="Search..."
                  className="pl-7 h-7 text-xs"
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                  onChange={(e) => onFiltersChange({ searchTerm: e.target.value, userIds: [], eventTypes: [], statuses: [] })}
                />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(true)}
                className="h-7 w-7"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </>
        )}

        {/* View & Filters Popover - Combined */}
        {onFiltersChange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Eye className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-3">
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">View Options</div>
                <CalendarVisibilityFilter />
                <CalendarFilters onFiltersChange={onFiltersChange} />
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Calendar Help */}
        <SectionHelpButton sectionId="calendar" />

        {/* View selector */}
        {view && onViewChange && (
          <Select value={view} onValueChange={onViewChange}>
            <SelectTrigger className="w-[70px] h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {!isTablet && <SelectItem value="month">Month</SelectItem>}
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Calendar picker for week/day views */}
        {((isDesktop && view && view !== 'month') || isTablet) && currentDate && onDateChange && (
          <Popover open={showCalendarPicker} onOpenChange={setShowCalendarPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background z-50" align="end">
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

        {/* More menu - Desktop scheduling options */}
        {isDesktop && onSchedulerClick && onManageTemplates && onViewBookings && onViewAnalytics && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 pointer-events-auto !z-[99999] bg-popover"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  handleSchedulerClick();
                }}
                disabled={explicitPermissions !== undefined && !permissionsLoading && !roleLoading && !canCreateAppointments}
                className="pointer-events-auto cursor-pointer text-xs"
              >
                New Booking Template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  onManageTemplates?.();
                }}
                className="pointer-events-auto cursor-pointer text-xs"
              >
                <SettingsIcon className="h-3.5 w-3.5 mr-2" />
                Manage Templates
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  onViewBookings?.();
                }}
                className="pointer-events-auto cursor-pointer text-xs"
              >
                <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                View Bookings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  onViewAnalytics?.();
                }}
                className="pointer-events-auto cursor-pointer text-xs"
              >
                <BarChart3 className="h-3.5 w-3.5 mr-2" />
                Analytics
              </DropdownMenuItem>
              {isConnected && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Google Sync</span>
                    <Switch
                      checked={googleSyncEnabled}
                      onCheckedChange={handleSyncToggle}
                      disabled={isSyncingFromGoogle || isSyncingAll}
                      className="scale-75"
                    />
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
