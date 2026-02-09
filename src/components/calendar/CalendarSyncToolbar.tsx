import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Settings as SettingsIcon, BarChart3, Search, Eye, MoreHorizontal, Users, ListTodo } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGoogleCalendarIntegration, useGoogleCalendarSync } from "@/hooks/useGoogleCalendar";
import { useOutlookCalendarIntegration, useOutlookCalendarSync } from "@/hooks/useOutlookCalendar";
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
import { useTeamMembers } from "@/hooks/useTeamMembers";
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
  onStaffFilterChange?: (staffUserId: string | null) => void;
  selectedStaffId?: string | null;
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
  onStaffFilterChange,
  selectedStaffId,
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
  const { integration: outlookIntegration, isConnected: isOutlookConnected } = useOutlookCalendarIntegration();
  const { syncFromOutlook, syncAllToOutlook, isSyncingFromOutlook, isSyncingAll: isSyncingAllOutlook } = useOutlookCalendarSync();
  const isTablet = useIsTablet();
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Calendar sync toggle state
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(() => {
    const saved = localStorage.getItem('googleSyncEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save sync preference
  useEffect(() => {
    localStorage.setItem('googleSyncEnabled', JSON.stringify(calendarSyncEnabled));
  }, [calendarSyncEnabled]);

  // Handle sync toggle
  const handleSyncToggle = async (enabled: boolean) => {
    setCalendarSyncEnabled(enabled);
    if (enabled) {
      if (isConnected) {
        await syncFromGoogle();
        await syncAllToGoogle();
      }
      if (isOutlookConnected) {
        await syncFromOutlook();
        await syncAllToOutlook();
      }
    }
  };

  // Auto-sync interval - every 5 minutes when enabled
  useEffect(() => {
    if ((!isConnected && !isOutlookConnected) || !calendarSyncEnabled) {
      return;
    }

    const lastGoogleSync = integration?.last_sync;
    const lastOutlookSync = outlookIntegration?.last_sync;
    const shouldSyncNow = (!lastGoogleSync && !lastOutlookSync) ||
      (lastGoogleSync && Date.now() - new Date(lastGoogleSync).getTime() > 5 * 60 * 1000) ||
      (lastOutlookSync && Date.now() - new Date(lastOutlookSync).getTime() > 5 * 60 * 1000);

    if (shouldSyncNow) {
      if (isConnected) { syncFromGoogle(); syncAllToGoogle(); }
      if (isOutlookConnected) { syncFromOutlook(); syncAllToOutlook(); }
    }

    const interval = setInterval(() => {
      if (calendarSyncEnabled) {
        if (isConnected) { syncFromGoogle(); syncAllToGoogle(); }
        if (isOutlookConnected) { syncFromOutlook(); syncAllToOutlook(); }
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isConnected, isOutlookConnected, calendarSyncEnabled, integration?.last_sync, outlookIntegration?.last_sync, syncFromGoogle, syncAllToGoogle, syncFromOutlook, syncAllToOutlook]);

  const { data: teamMembers } = useTeamMembers();

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

  const getLastSyncText = (lastSync?: string | null) => {
    if (!lastSync) return 'Never';

    const secondsAgo = Math.floor((Date.now() - new Date(lastSync).getTime()) / 1000);

    if (secondsAgo < 60) return 'Now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h`;
    return `${Math.floor(secondsAgo / 86400)}d`;
  };
  
  const anyCalendarConnected = isConnected || isOutlookConnected;
  const anySyncing = (isSyncingFromGoogle || isSyncingAll || isSyncingFromOutlook || isSyncingAllOutlook) && calendarSyncEnabled;

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
          {anyCalendarConnected && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 ml-2">
                    {(integration?.active || outlookIntegration?.active) ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-destructive" />
                    )}
                    {anySyncing && (
                      <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {isConnected && <p>Google Calendar: {getLastSyncText(integration?.last_sync)}</p>}
                  {isOutlookConnected && <p>Outlook Calendar: {getLastSyncText(outlookIntegration?.last_sync)}</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {/* Staff Calendar Selector */}
      {onStaffFilterChange && teamMembers && teamMembers.length > 0 && (
        <div className="flex items-center ml-2">
          <Select
            value={selectedStaffId || "all"}
            onValueChange={(value) => onStaffFilterChange(value === "all" ? null : value)}
          >
            <SelectTrigger className="h-7 w-[140px] text-xs gap-1">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <SelectValue placeholder="All Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              <SelectItem value={user?.id || "me"}>My Calendar</SelectItem>
              {teamMembers
                .filter((m: any) => m.user_id !== user?.id)
                .map((member: any) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    {member.full_name || member.email || 'Team Member'}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex-1" />

      {/* Right section - Actions */}
      {/* Right section - simplified to 3 controls max */}
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

        {/* Tasks toggle */}
        {onTasksClick && (
          <Button
            variant={showTasksView ? "default" : "ghost"}
            size="sm"
            onClick={onTasksClick}
            className="h-7 gap-1 px-2 text-xs"
            title={showTasksView ? "Show Calendar" : "Show Tasks"}
          >
            <ListTodo className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tasks</span>
          </Button>
        )}

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

        {/* Unified menu - filters, date picker, scheduling, sync */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 pointer-events-auto !z-[99999] bg-popover"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {/* Filters */}
            {onFiltersChange && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="pointer-events-auto cursor-pointer text-xs">
                      <Eye className="h-3.5 w-3.5 mr-2" />
                      Filters & Visibility
                    </DropdownMenuItem>
                  </PopoverTrigger>
                  <PopoverContent side="left" align="start" className="w-64 p-3">
                    <div className="space-y-3">
                      <div className="text-xs font-medium text-muted-foreground">View Options</div>
                      <CalendarVisibilityFilter />
                      <CalendarFilters onFiltersChange={onFiltersChange} />
                    </div>
                  </PopoverContent>
                </Popover>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Date picker */}
            {currentDate && onDateChange && (
              <Popover open={showCalendarPicker} onOpenChange={setShowCalendarPicker}>
                <PopoverTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="pointer-events-auto cursor-pointer text-xs">
                    <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                    Go to Date
                  </DropdownMenuItem>
                </PopoverTrigger>
                <PopoverContent side="left" className="w-auto p-0 bg-background z-50" align="start">
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

            {/* Scheduling options */}
            {isDesktop && onSchedulerClick && (
              <>
                <DropdownMenuSeparator />
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
              </>
            )}
            {isDesktop && onManageTemplates && (
              <DropdownMenuItem
                onSelect={(e) => { e.preventDefault(); onManageTemplates?.(); }}
                className="pointer-events-auto cursor-pointer text-xs"
              >
                <SettingsIcon className="h-3.5 w-3.5 mr-2" />
                Manage Templates
              </DropdownMenuItem>
            )}
            {isDesktop && onViewBookings && (
              <DropdownMenuItem
                onSelect={(e) => { e.preventDefault(); onViewBookings?.(); }}
                className="pointer-events-auto cursor-pointer text-xs"
              >
                <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                View Bookings
              </DropdownMenuItem>
            )}
            {isDesktop && onViewAnalytics && (
              <DropdownMenuItem
                onSelect={(e) => { e.preventDefault(); onViewAnalytics?.(); }}
                className="pointer-events-auto cursor-pointer text-xs"
              >
                <BarChart3 className="h-3.5 w-3.5 mr-2" />
                Analytics
              </DropdownMenuItem>
            )}

            {/* Sync toggle */}
            {anyCalendarConnected && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {isConnected && isOutlookConnected ? 'Calendar Sync' : isConnected ? 'Google Sync' : 'Outlook Sync'}
                  </span>
                  <Switch
                    checked={calendarSyncEnabled}
                    onCheckedChange={handleSyncToggle}
                    disabled={anySyncing}
                    className="scale-75"
                  />
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
