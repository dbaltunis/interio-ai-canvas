import { Button } from "@/components/ui/button";
import { RefreshCw, Upload, Download, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight, Link2, Calendar as CalendarIcon, UserPlus, Settings as SettingsIcon, BarChart3 } from "lucide-react";
import { useGoogleCalendarIntegration, useGoogleCalendarSync } from "@/hooks/useGoogleCalendar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow, format } from "date-fns";
import { useState, useEffect } from "react";
import { CalendarFilters, CalendarFilterState } from "./CalendarFilters";
import { CalendarVisibilityFilter } from "./filters/CalendarVisibilityFilter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";

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
  onViewAnalytics
}: CalendarSyncToolbarProps) => {
  const { integration, isConnected } = useGoogleCalendarIntegration();
  const { syncFromGoogle, syncAllToGoogle, isSyncingFromGoogle, isSyncingAll } = useGoogleCalendarSync();
  const isTablet = useIsTablet();
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  
  // Auto-sync state
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => {
    const saved = localStorage.getItem('autoSyncEnabled');
    return saved !== null ? JSON.parse(saved) : true; // Default: enabled
  });

  // Save auto-sync preference
  useEffect(() => {
    localStorage.setItem('autoSyncEnabled', JSON.stringify(autoSyncEnabled));
  }, [autoSyncEnabled]);

  // Auto-sync interval - every 5 minutes
  useEffect(() => {
    if (!isConnected || !autoSyncEnabled) return;

    // Sync immediately on mount if last sync > 5 minutes ago
    const lastSyncTime = integration?.last_sync;
    if (!lastSyncTime || Date.now() - new Date(lastSyncTime).getTime() > 5 * 60 * 1000) {
      console.log('Initial auto-sync triggered');
      syncFromGoogle();
    }

    // Set up interval for background sync every 5 minutes
    const interval = setInterval(() => {
      console.log('Background auto-sync triggered');
      syncFromGoogle();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isConnected, autoSyncEnabled, syncFromGoogle]);

  const isMobile = useIsMobile();
  const isDesktop = !isMobile && !isTablet;

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
            <h2 className="text-sm md:text-base font-semibold ml-1">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
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
          {isSyncingFromGoogle && autoSyncEnabled && (
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
                  onSchedulerClick?.();
                }}
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
            onClick={onSchedulerClick}
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

        {/* Google Calendar sync controls (only if connected) */}
        {isConnected && (
          <>
            {/* Auto-sync toggle */}
            <div className="flex items-center gap-1">
              <Switch
                id="auto-sync"
                checked={autoSyncEnabled}
                onCheckedChange={setAutoSyncEnabled}
                className="scale-75"
              />
              <Label htmlFor="auto-sync" className="text-[10px] sm:text-[11px] cursor-pointer text-muted-foreground whitespace-nowrap hidden md:block">
                Auto 5m
              </Label>
            </div>

            {/* Manual sync buttons */}
            {/* Manual sync buttons - Hidden on smaller screens */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => syncFromGoogle()}
              disabled={isSyncingFromGoogle || isSyncingAll}
              className="h-6 px-1.5 sm:px-2 gap-1 text-[11px] hidden xl:flex"
              title="Import from Google Calendar"
            >
              {isSyncingFromGoogle ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              <span>Import</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => syncAllToGoogle()}
              disabled={isSyncingFromGoogle || isSyncingAll}
              className="h-6 px-1.5 sm:px-2 gap-1 text-[11px] hidden xl:flex"
              title="Export to Google Calendar"
            >
              {isSyncingAll ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
              <span>Export</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
