import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lightbulb, RotateCcw, ChevronRight, Check, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTeaching } from '@/contexts/TeachingContext';
import { getTeachingPointsForPage, allTeachingPoints, TeachingPoint } from '@/config/teachingPoints';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TeachingHelpButtonProps {
  className?: string;
}

/**
 * Icon-only tips button that navigates to features and shows guidance.
 */
export const TeachingHelpButton = ({
  className,
}: TeachingHelpButtonProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    isTeachingEnabled,
    setTeachingEnabled, 
    resetAllTeaching,
    showTeaching,
    hasSeenTeaching,
    isDismissedForever,
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

  // Get ALL tips, not just current page
  const allTips = allTeachingPoints;
  
  // Group by category
  const groupedTeachings = allTips.reduce<Record<string, TeachingPoint[]>>((acc, tp) => {
    const category = tp.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(tp);
    return acc;
  }, {});

  const unseenCount = allTips.filter(
    tp => !hasSeenTeaching(tp.id) && !isDismissedForever(tp.id)
  ).length;

  const handleShowTeaching = (tp: TeachingPoint) => {
    // Build the navigation URL based on trigger config
    let targetUrl = '/';
    
    if (tp.trigger.page === '/settings') {
      targetUrl = `/settings?section=${tp.trigger.section || 'personal'}`;
    } else if (tp.trigger.page === '/app') {
      targetUrl = `/?tab=${tp.trigger.section || 'dashboard'}`;
    } else if (tp.trigger.page) {
      targetUrl = tp.trigger.page;
    }
    
    setOpen(false);
    
    // Navigate first, then scroll to element and show teaching
    navigate(targetUrl);
    setTimeout(() => {
      // Try to scroll to the target element
      if (tp.targetSelector) {
        const element = document.querySelector(tp.targetSelector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      // Show the teaching popover
      showTeaching(tp.id);
    }, 600);
  };

  const formatCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      settings: '⚙️ Settings',
      app: '📱 App Features',
      feature: '✨ Features',
    };
    return names[category] || category;
  };

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 relative", className)}
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
                        {unseenCount > 9 ? '9+' : unseenCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Tips & Guidance</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent 
          side="bottom" 
          align="end" 
          className="w-80 p-0 overflow-hidden"
          sideOffset={8}
        >
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Tips & Guidance</h3>
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
              Click any tip to navigate there and learn more
            </p>
          </div>

          {/* Teaching List */}
          <ScrollArea className="h-80">
            <div className="p-2">
              {Object.entries(groupedTeachings).map(([category, teachings]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <h4 className="text-xs font-medium text-muted-foreground px-2 mb-1 sticky top-0 bg-popover py-1">
                    {formatCategoryName(category)}
                  </h4>
                  {teachings.map(tp => {
                    const seen = hasSeenTeaching(tp.id);
                    const dismissed = isDismissedForever(tp.id);
                    
                    return (
                      <motion.button
                        key={tp.id}
                        onClick={() => handleShowTeaching(tp)}
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
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
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
                    No tips available
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
    </TooltipProvider>
  );
};

/**
 * Floating tips button for bottom-right corner (legacy)
 */
export const FloatingTeachingButton = ({ className }: { className?: string }) => {
  const { user } = useAuth();
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

