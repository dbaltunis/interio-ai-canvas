import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Settings as SettingsIcon, BarChart3, Search, Eye, MoreHorizontal, Users, ListTodo } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGoogleCalendarIntegration, useGoogleCalendarSync } from "@/hooks/useGoogleCalendar";
import { useOutlookCalendarIntegration, useOutlookCalendarSync } from "@/hooks/useOutlookCalendar";
import { useNylasCalendarIntegration, useNylasCalendarSync } from "@/hooks/useNylasCalendar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, startOfWeek, endOfWeek, isSameMonth } from "date-fns";
import { useState, useEffect } from "react";
import { CalendarFilters, CalendarFilterState } from "./CalendarFilters";
import { CalendarVisibilityFilter } from "./filters/CalendarVisibilityFilter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCalendarPermissions } from "@/hooks/useCalendarPermissions";
import { useToast } from "@/hooks/use-toast";

type CalendarView = 'month' | 'week' | 'day';

interface CalendarSyncToolbarProps {
  currentDate?: Date;
  view?: CalendarView;
  onTodayClick?: () => void;
  onPrevClick?: () => void;
  onNextClick?: () => void;
  onViewChange?: (view: CalendarView) => void;
  filters?: CalendarFilterState;
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
  filters,
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
  const { integration: nylasIntegration, isConnected: isNylasConnected } = useNylasCalendarIntegration();
  const { syncFromNylas, syncToNylas, isSyncingFromNylas, isSyncingToNylas } = useNylasCalendarSync();
  const isTablet = useIsTablet();
  const isMobile = useIsMobile();
  const isDesktop = !isMobile && !isTablet;
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const { data: teamMembers } = useTeamMembers();
  const { user } = useAuth();
  const { toast } = useToast();
  const { canCreateAppointments, isPermissionLoaded } = useCalendarPermissions();

  // Calendar sync toggle state
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(() => {
    const saved = localStorage.getItem('googleSyncEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('googleSyncEnabled', JSON.stringify(calendarSyncEnabled));
  }, [calendarSyncEnabled]);

  const handleSyncToggle = async (enabled: boolean) => {
    setCalendarSyncEnabled(enabled);
    if (enabled) {
      if (isConnected) { await syncFromGoogle(); await syncAllToGoogle(); }
      if (isOutlookConnected) { await syncFromOutlook(); await syncAllToOutlook(); }
      if (isNylasConnected) { await syncFromNylas(); await syncToNylas(); }
    }
  };

  // Auto-sync interval
  useEffect(() => {
    if ((!isConnected && !isOutlookConnected && !isNylasConnected) || !calendarSyncEnabled) return;

    const lastGoogleSync = integration?.last_sync;
    const lastOutlookSync = outlookIntegration?.last_sync;
    const lastNylasSync = nylasIntegration?.last_sync;
    const shouldSyncNow = (!lastGoogleSync && !lastOutlookSync && !lastNylasSync) ||
      (lastGoogleSync && Date.now() - new Date(lastGoogleSync).getTime() > 5 * 60 * 1000) ||
      (lastOutlookSync && Date.now() - new Date(lastOutlookSync).getTime() > 5 * 60 * 1000) ||
      (lastNylasSync && Date.now() - new Date(lastNylasSync).getTime() > 5 * 60 * 1000);

    if (shouldSyncNow) {
      if (isConnected) { syncFromGoogle(); syncAllToGoogle(); }
      if (isOutlookConnected) { syncFromOutlook(); syncAllToOutlook(); }
      if (isNylasConnected) { syncFromNylas(); syncToNylas(); }
    }

    const interval = setInterval(() => {
      if (calendarSyncEnabled) {
        if (isConnected) { syncFromGoogle(); syncAllToGoogle(); }
        if (isOutlookConnected) { syncFromOutlook(); syncAllToOutlook(); }
        if (isNylasConnected) { syncFromNylas(); syncToNylas(); }
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isConnected, isOutlookConnected, isNylasConnected, calendarSyncEnabled, integration?.last_sync, outlookIntegration?.last_sync, nylasIntegration?.last_sync, syncFromGoogle, syncAllToGoogle, syncFromOutlook, syncAllToOutlook, syncFromNylas, syncToNylas]);

  const handleSchedulerClick = () => {
    if (isPermissionLoaded && !canCreateAppointments) {
      toast({ title: "Permission Denied", description: "You don't have permission to create appointments.", variant: "destructive" });
      return;
    }
    if (!isPermissionLoaded) {
      toast({ title: "Loading", description: "Please wait while permissions are being checked..." });
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

  const anyCalendarConnected = isConnected || isOutlookConnected || isNylasConnected;
  const anySyncing = (isSyncingFromGoogle || isSyncingAll || isSyncingFromOutlook || isSyncingAllOutlook || isSyncingFromNylas || isSyncingToNylas) && calendarSyncEnabled;

  // Title text for current date range
  const dateTitle = currentDate && view ? (
    view === 'day'
      ? format(currentDate, 'EEE, MMM d, yyyy')
      : view === 'week'
        ? (() => {
            const weekStart = startOfWeek(currentDate);
            const weekEnd = endOfWeek(currentDate);
            return isSameMonth(weekStart, weekEnd)
              ? `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'd, yyyy')}`
              : `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
          })()
        : format(currentDate, 'MMMM yyyy')
  ) : '';

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left: Navigation */}
      {currentDate && view && onTodayClick && onPrevClick && onNextClick && (
        <div className="flex items-center gap-1.5">
          {/* Today button — prominent */}
          <Button
            variant="outline"
            size="sm"
            onClick={onTodayClick}
            className="h-8 px-3 text-xs font-semibold bg-primary/5 hover:bg-primary/10 border-primary/20"
          >
            Today
          </Button>

          {/* Nav arrows — larger */}
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onPrevClick} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onNextClick} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Date title — clickable for date picker */}
          <Popover open={showCalendarPicker} onOpenChange={setShowCalendarPicker}>
            <PopoverTrigger asChild>
              <button className="text-base font-semibold ml-1 hover:text-primary transition-colors cursor-pointer">
                {dateTitle}
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" className="w-auto p-0 bg-background z-50" align="start">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => {
                  if (date) {
                    onDateChange?.(date);
                    setShowCalendarPicker(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Sync status */}
          {anyCalendarConnected && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 ml-1">
                    {(integration?.active || outlookIntegration?.active || nylasIntegration?.active) ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-destructive" />
                    )}
                    {anySyncing && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {isConnected && <p>Google: {getLastSyncText(integration?.last_sync)}</p>}
                  {isOutlookConnected && <p>Outlook: {getLastSyncText(outlookIntegration?.last_sync)}</p>}
                  {isNylasConnected && <p>Nylas: {getLastSyncText(nylasIntegration?.last_sync)}</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {/* Staff filter */}
      {onStaffFilterChange && teamMembers && teamMembers.length > 0 && (
        <div className="flex items-center ml-1">
          <Select
            value={selectedStaffId || "all"}
            onValueChange={(value) => onStaffFilterChange(value === "all" ? null : value)}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs gap-1">
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

      {/* Right section */}
      <div className="flex items-center gap-1.5">
        {/* Search */}
        {onFiltersChange && (
          <>
            {showSearch ? (
              <div className="relative w-44 animate-in slide-in-from-right-2 duration-200">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
                <Input
                  placeholder="Search..."
                  className="pl-7 h-8 text-xs"
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                  onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value } as CalendarFilterState)}
                />
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)} className="h-8 w-8">
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
            className="h-8 gap-1.5 px-2.5 text-xs"
          >
            <ListTodo className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tasks</span>
          </Button>
        )}

        {/* View selector — segmented control */}
        {view && onViewChange && (
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
            <button
              type="button"
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                view === 'day'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => onViewChange('day')}
            >
              Day
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                view === 'week'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => onViewChange('week')}
            >
              Week
            </button>
            {!isTablet && (
              <button
                type="button"
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  view === 'month'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => onViewChange('month')}
              >
                Month
              </button>
            )}
          </div>
        )}

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
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

            {/* Scheduling options */}
            {isDesktop && onSchedulerClick && (
              <DropdownMenuItem
                onSelect={(e) => { e.preventDefault(); handleSchedulerClick(); }}
                disabled={isPermissionLoaded && !canCreateAppointments}
                className="pointer-events-auto cursor-pointer text-xs"
              >
                New Booking Template
              </DropdownMenuItem>
            )}
            {isDesktop && onManageTemplates && (
              <DropdownMenuItem
                onSelect={(e) => { e.preventDefault(); onManageTemplates(); }}
                className="pointer-events-auto cursor-pointer text-xs"
              >
                <SettingsIcon className="h-3.5 w-3.5 mr-2" />
                Manage Templates
              </DropdownMenuItem>
            )}
            {isDesktop && onViewBookings && (
              <DropdownMenuItem
                onSelect={(e) => { e.preventDefault(); onViewBookings(); }}
                className="pointer-events-auto cursor-pointer text-xs"
              >
                <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                View Bookings
              </DropdownMenuItem>
            )}
            {isDesktop && onViewAnalytics && (
              <DropdownMenuItem
                onSelect={(e) => { e.preventDefault(); onViewAnalytics(); }}
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
                  <span className="text-xs text-muted-foreground">Calendar Sync</span>
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
