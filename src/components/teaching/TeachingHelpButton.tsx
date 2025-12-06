import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Lightbulb, RotateCcw, ChevronRight, Check, Sparkles } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';

interface TeachingHelpButtonProps {
  className?: string;
  /** Render as icon-only button for compact layouts */
  variant?: 'default' | 'icon';
}

/**
 * Modern floating tips button with sleek 2026 design.
 * Shows available tips for the current page with smart grouping.
 */
export const TeachingHelpButton = ({
  className,
  variant = 'default',
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

  // ONLY get tips for current section - strict filtering
  const pageTeachings = getTeachingPointsForPage(currentPage, currentSection);
  
  // Group by section - but only show CURRENT section's tips
  const groupedTeachings = pageTeachings.reduce<Record<string, TeachingPoint[]>>((acc, tp) => {
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

  const isIconVariant = variant === 'icon';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isIconVariant ? (
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0 relative", className)}
            >
              <Lightbulb className="h-4 w-4" />
              <AnimatePresence>
                {unseenCount > 0 && isTeachingEnabled && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold"
                  >
                    {unseenCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className={cn(
                "relative gap-2 rounded-full shadow-lg",
                "bg-primary hover:bg-primary/90",
                "transition-all duration-200",
                className
              )}
            >
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm font-medium">Tips</span>
              <AnimatePresence>
                {unseenCount > 0 && isTeachingEnabled && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold"
                  >
                    {unseenCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          )}
        </motion.div>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="end" 
        className="w-80 p-0 overflow-hidden"
        sideOffset={12}
      >
        {/* Header with gradient */}
        <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Quick Tips</h3>
            </div>
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
              ? 'Click any tip below to learn more'
              : 'Tips are currently disabled'}
          </p>
        </div>

        {/* Teaching List */}
        <ScrollArea className="max-h-72">
          <div className="p-2">
            {Object.entries(groupedTeachings).map(([section, teachings]) => (
              <div key={section} className="mb-3 last:mb-0">
                <h4 className="text-xs font-medium text-muted-foreground px-2 mb-1 uppercase tracking-wide">
                  {formatSectionName(section)}
                </h4>
                {teachings.map(tp => {
                  const seen = hasSeenTeaching(tp.id);
                  const dismissed = isDismissedForever(tp.id);
                  
                  return (
                    <motion.button
                      key={tp.id}
                      onClick={() => handleShowTeaching(tp.id)}
                      disabled={dismissed}
                      whileHover={{ x: 2 }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left",
                        "hover:bg-accent transition-colors",
                        dismissed && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0",
                        seen ? "bg-primary/20 text-primary" : "bg-primary text-primary-foreground"
                      )}>
                        {seen ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Lightbulb className="h-3 w-3" />
                        )}
                      </div>
                      <span className={cn(
                        "text-sm flex-1",
                        seen && "text-muted-foreground"
                      )}>
                        {tp.title}
                      </span>
                      {!dismissed && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}
            
            {Object.keys(groupedTeachings).length === 0 && (
              <div className="text-center py-8 px-4">
                <Lightbulb className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No tips for this page yet
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAllTeaching}
            className="w-full justify-center gap-2 text-xs hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Show all tips again
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Floating tips button for bottom-right corner
 * Modern 2026 style - sleek pill button instead of question mark
 */
export const FloatingTeachingButton = ({ className }: { className?: string }) => {
  const { user } = useAuth();
  
  // Don't show on auth pages or when not logged in
  if (!user) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className={cn("fixed bottom-6 right-6 z-50", className)}
    >
      <TeachingHelpButton />
    </motion.div>
  );
};
