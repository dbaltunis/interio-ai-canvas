import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HelpCircle, RotateCcw, ChevronRight, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTeaching } from '@/contexts/TeachingContext';
import { getTeachingPointsForPage, TeachingPoint } from '@/config/teachingPoints';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

interface TeachingHelpButtonProps {
  className?: string;
}

/**
 * Floating help button that shows available teachings for the current page.
 * Users can re-trigger dismissed teachings and control teaching visibility.
 */
export const TeachingHelpButton = ({
  className,
}: TeachingHelpButtonProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { 
    isTeachingEnabled,
    setTeachingEnabled, 
    resetAllTeaching,
    showTeaching,
    hasSeenTeaching,
    isDismissedForever,
    progress,
  } = useTeaching();

  // Derive current page/section from route
  const path = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  let currentPage = path;
  let currentSection: string | undefined;
  
  if (path === '/' || path === '/app') {
    currentPage = '/app';
    currentSection = searchParams.get('tab') || 'dashboard';
  } else if (path === '/settings') {
    currentSection = searchParams.get('section') || 'personal';
  }

  const pageTeachings = getTeachingPointsForPage(currentPage, currentSection);
  const allTeachings = getTeachingPointsForPage(currentPage);
  
  // Group teachings by section
  const groupedTeachings = allTeachings.reduce<Record<string, TeachingPoint[]>>((acc, tp) => {
    const section = tp.trigger.section || 'general';
    if (!acc[section]) acc[section] = [];
    acc[section].push(tp);
    return acc;
  }, {});

  const unseenCount = pageTeachings.filter(
    tp => !hasSeenTeaching(tp.id) && !isDismissedForever(tp.id)
  ).length;

  const handleShowTeaching = (id: string) => {
    showTeaching(id);
    setOpen(false);
  };

  const formatSectionName = (section: string): string => {
    return section
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "relative h-10 w-10 rounded-full shadow-lg border-2",
            "bg-background hover:bg-accent",
            "transition-all duration-200",
            className
          )}
        >
          <HelpCircle className="h-5 w-5" />
          {unseenCount > 0 && isTeachingEnabled && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
              {unseenCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="end" 
        className="w-80 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Help & Tips</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {isTeachingEnabled ? 'On' : 'Off'}
              </span>
              <Switch
                checked={isTeachingEnabled}
                onCheckedChange={setTeachingEnabled}
                className="scale-75"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {isTeachingEnabled 
              ? 'Tips will appear as you explore the app'
              : 'Tips are currently disabled'}
          </p>
        </div>

        {/* Teaching List */}
        <ScrollArea className="max-h-64">
          <div className="p-2">
            {Object.entries(groupedTeachings).map(([section, teachings]) => (
              <div key={section} className="mb-3 last:mb-0">
                <h4 className="text-xs font-medium text-muted-foreground px-2 mb-1">
                  {formatSectionName(section)}
                </h4>
                {teachings.map(tp => {
                  const seen = hasSeenTeaching(tp.id);
                  const dismissed = isDismissedForever(tp.id);
                  
                  return (
                    <button
                      key={tp.id}
                      onClick={() => handleShowTeaching(tp.id)}
                      disabled={dismissed}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left",
                        "hover:bg-accent transition-colors",
                        dismissed && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0",
                        seen ? "bg-primary/20 text-primary" : "bg-muted"
                      )}>
                        {seen ? (
                          <Check className="h-2.5 w-2.5" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className={cn(
                        "text-sm flex-1 truncate",
                        seen && "text-muted-foreground"
                      )}>
                        {tp.title}
                      </span>
                      {!dismissed && (
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            
            {Object.keys(groupedTeachings).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tips available for this page
              </p>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAllTeaching}
            className="w-full justify-center gap-2 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            Reset all tips
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Minimal floating help button for bottom-right corner
 * Only shows when user is authenticated
 */
export const FloatingTeachingButton = ({ className }: { className?: string }) => {
  const { user } = useAuth();
  
  // Don't show on auth pages or when not logged in
  if (!user) return null;
  
  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <TeachingHelpButton />
    </div>
  );
};
