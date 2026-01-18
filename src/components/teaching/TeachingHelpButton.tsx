import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lightbulb, RotateCcw, Check, Sparkles, HelpCircle, Trophy, Settings, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useTeaching } from '@/contexts/TeachingContext';
import { allTeachingPoints, TeachingPoint, getTeachingPointsForPage } from '@/config/teachingPoints';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { HelpCenterDrawer } from '@/components/help/HelpCenterDrawer';
import { TipCard } from './TipCard';
import { TipSearchInput } from './TipSearchInput';
import { RecommendedTips } from './RecommendedTips';
import { TipConfirmationDialog } from './TipConfirmationDialog';

interface TeachingHelpButtonProps {
  className?: string;
}

type TabCategory = 'all' | 'getting-started' | 'features' | 'settings';

const TAB_CONFIG: { id: TabCategory; label: string; filter: (tp: TeachingPoint) => boolean }[] = [
  { id: 'all', label: 'All', filter: () => true },
  { id: 'getting-started', label: 'Start', filter: (tp) => tp.priority === 'high' },
  { id: 'features', label: 'Features', filter: (tp) => tp.category === 'app' },
  { id: 'settings', label: 'Settings', filter: (tp) => tp.category === 'settings' },
];

/**
 * Premium Tips & Guidance panel with tabs, search, and progress tracking.
 */
export const TeachingHelpButton = ({
  className,
}: TeachingHelpButtonProps) => {
  const [open, setOpen] = useState(false);
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabCategory>('all');
  const [confirmationTip, setConfirmationTip] = useState<TeachingPoint | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    isTeachingEnabled,
    setTeachingEnabled, 
    resetAllTeaching,
    hasSeenTeaching,
    isDismissedForever,
    completeTeaching,
    showSpotlightForTip,
  } = useTeaching();

  // Keyboard shortcut: ⌘? or Ctrl+?
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get all tips
  const allTips = allTeachingPoints;
  
  // Calculate progress
  const completedCount = allTips.filter(tp => hasSeenTeaching(tp.id) || isDismissedForever(tp.id)).length;
  const totalCount = allTips.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const unseenCount = totalCount - completedCount;

  // Get contextual recommendations based on current page
  const currentSection = useMemo(() => {
    const params = new URLSearchParams(location.search);
    if (location.pathname === '/') {
      return params.get('tab') || 'dashboard';
    }
    if (location.pathname === '/settings') {
      return params.get('section') || 'personal';
    }
    return undefined;
  }, [location]);

  const contextualTips = useMemo(() => {
    const pageTips = getTeachingPointsForPage(location.pathname, currentSection);
    return pageTips.filter(tp => !hasSeenTeaching(tp.id) && !isDismissedForever(tp.id));
  }, [location.pathname, currentSection, hasSeenTeaching, isDismissedForever]);

  // Filter tips based on search and tab
  const filteredTips = useMemo(() => {
    const tabFilter = TAB_CONFIG.find(t => t.id === activeTab)?.filter || (() => true);
    
    return allTips.filter(tp => {
      // Tab filter
      if (!tabFilter(tp)) return false;
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          tp.title.toLowerCase().includes(query) ||
          tp.description.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [allTips, activeTab, searchQuery]);

  // Get encouraging message based on progress
  const getEncouragingMessage = () => {
    if (progressPercent === 100) return "You're a power user! 🎉";
    if (progressPercent >= 75) return "Almost there! Keep going!";
    if (progressPercent >= 50) return "Great progress! Halfway done.";
    if (progressPercent >= 25) return "Nice start! Keep exploring.";
    return "Start exploring your new app!";
  };

  // Handle tip selection - show confirmation dialog
  const handleTipSelect = (tp: TeachingPoint) => {
    setConfirmationTip(tp);
  };

  // Handle confirmed navigation with spotlight
  const handleConfirmedNavigation = () => {
    if (!confirmationTip) return;
    
    const tp = confirmationTip;
    setConfirmationTip(null);
    setOpen(false);
    
    // Build the navigation URL based on trigger config
    let targetUrl = '/';
    
    if (tp.trigger.page === '/settings') {
      targetUrl = `/settings?section=${tp.trigger.section || 'personal'}`;
    } else if (tp.trigger.page === '/app') {
      targetUrl = `/?tab=${tp.trigger.section || 'dashboard'}`;
    } else if (tp.trigger.page) {
      targetUrl = tp.trigger.page;
    }
    
    // Navigate to the page
    navigate(targetUrl);
    
    // After navigation, scroll to element and show spotlight
    setTimeout(() => {
      if (tp.targetSelector) {
        const element = document.querySelector(tp.targetSelector);
        if (element) {
          // Smooth scroll to element
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Wait for scroll to complete, then show spotlight
          setTimeout(() => {
            showSpotlightForTip(tp);
          }, 500);
          return;
        }
      }
      
      // No target selector - just show toast and complete
      toast.info(tp.title, {
        description: tp.description,
        duration: 6000,
      });
      completeTeaching(tp.id);
    }, 300);
  };

  const isAllComplete = progressPercent === 100;

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
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold"
                      >
                        {unseenCount > 9 ? '9+' : unseenCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex items-center gap-2">
            <p>Tips & Guidance</p>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>?
            </kbd>
          </TooltipContent>
        </Tooltip>
        <PopoverContent 
          side="bottom" 
          align="end" 
          className="w-[340px] p-0 overflow-hidden"
          sideOffset={8}
        >
          {/* Premium Header with Gradient */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5" />
            <div className="relative p-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Tips & Guidance</h3>
                    <p className="text-[10px] text-muted-foreground">
                      {getEncouragingMessage()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setTeachingEnabled(!isTeachingEnabled)}
                      >
                        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{isTeachingEnabled ? 'Disable' : 'Enable'} tips</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">
                    {completedCount} of {totalCount} completed
                  </span>
                  <span className="font-medium text-primary">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-1.5" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-3 pb-2">
            <TipSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {/* Contextual Recommendations (when not searching) */}
          {!searchQuery && contextualTips.length > 0 && (
            <RecommendedTips
              tips={contextualTips}
              onSelect={handleTipSelect}
            />
          )}

          {/* Category Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabCategory)}>
            <div className="px-3 border-b">
              <TabsList variant="segment" className="w-full h-8">
                {TAB_CONFIG.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} variant="segment" className="text-xs">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tips List */}
            <ScrollArea className="h-64">
              <TabsContent value={activeTab} className="m-0 p-2 space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {isAllComplete && !searchQuery ? (
                    // Celebration State
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-8 px-4 text-center"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Trophy className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">You've explored everything!</h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        You're now a power user. Need help with something specific?
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetAllTeaching}
                        className="text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1.5" />
                        Reset & Start Fresh
                      </Button>
                    </motion.div>
                  ) : filteredTips.length === 0 ? (
                    // No Results State
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-8 px-4 text-center"
                    >
                      <Lightbulb className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No tips found
                      </p>
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                          className="mt-2 text-xs"
                        >
                          Clear search
                        </Button>
                      )}
                    </motion.div>
                  ) : (
                    // Tips List
                    filteredTips.map((tip, index) => (
                      <TipCard
                        key={tip.id}
                        tip={tip}
                        isSeen={hasSeenTeaching(tip.id)}
                        isDismissed={isDismissedForever(tip.id)}
                        onSelect={handleTipSelect}
                        index={index}
                      />
                    ))
                  )}
                </AnimatePresence>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Footer */}
          <div className="p-3 border-t bg-muted/30 space-y-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setOpen(false);
                setHelpCenterOpen(true);
              }}
              className="w-full justify-center gap-2 text-xs"
            >
              <HelpCircle className="h-3 w-3" />
              Interactive Guides
            </Button>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAllTeaching}
                className="text-xs hover:bg-muted h-7 px-2"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset all
              </Button>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Keyboard className="h-3 w-3" />
                ⌘? to open
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Help Center Drawer */}
      <HelpCenterDrawer open={helpCenterOpen} onOpenChange={setHelpCenterOpen} />
      
      {/* Tip Confirmation Dialog */}
      <TipConfirmationDialog
        tip={confirmationTip}
        open={!!confirmationTip}
        onOpenChange={(open) => !open && setConfirmationTip(null)}
        onConfirm={handleConfirmedNavigation}
      />
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
