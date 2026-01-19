import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Lightbulb, RotateCcw, Sparkles, HelpCircle, Trophy, Keyboard, 
  Play, Award, Lock, Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useTeaching } from '@/contexts/TeachingContext';
import { allTeachingPoints, TeachingPoint, getTeachingPointsForPage } from '@/config/teachingPoints';
import { achievementBadges, getBadgeProgress, isBadgeUnlocked } from '@/config/achievementBadges';
import { cn } from '@/lib/utils';
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
import { BadgeCelebration } from './BadgeCelebration';
import { useRestartWelcomeTour } from './WelcomeTour';

type TabCategory = 'all' | 'getting-started' | 'features' | 'settings' | 'badges';

const TAB_CONFIG: { id: TabCategory; label: string; filter?: (tp: TeachingPoint) => boolean }[] = [
  { id: 'all', label: 'All', filter: () => true },
  { id: 'getting-started', label: 'Start', filter: (tp) => tp.priority === 'high' },
  { id: 'features', label: 'Features', filter: (tp) => tp.category === 'app' },
  { id: 'settings', label: 'Settings', filter: (tp) => tp.category === 'settings' },
  { id: 'badges', label: 'Badges' },
];

/**
 * Standalone Tips Panel component - can be embedded in Team Hub or used elsewhere
 */
export const TipsPanel = () => {
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabCategory>('all');
  const [confirmationTip, setConfirmationTip] = useState<TeachingPoint | null>(null);
  const [celebratingBadge, setCelebratingBadge] = useState<typeof achievementBadges[0] | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const restartWelcomeTour = useRestartWelcomeTour();
  
  const { 
    isTeachingEnabled,
    setTeachingEnabled, 
    resetAllTeaching,
    hasSeenTeaching,
    isDismissedForever,
    completeTeaching,
    showSpotlightForTip,
    progress,
  } = useTeaching();

  // Get all completed tips
  const completedTips = useMemo(() => {
    return [...progress.seenTeachingPoints, ...progress.dismissedForever];
  }, [progress.seenTeachingPoints, progress.dismissedForever]);

  // Get all tips
  const allTips = allTeachingPoints;
  
  // Calculate progress
  const completedCount = allTips.filter(tp => hasSeenTeaching(tp.id) || isDismissedForever(tp.id)).length;
  const totalCount = allTips.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Get contextual recommendations
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
    const tabConfig = TAB_CONFIG.find(t => t.id === activeTab);
    const tabFilter = tabConfig?.filter || (() => true);
    
    return allTips.filter(tp => {
      if (!tabFilter(tp)) return false;
      
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

  // Get encouraging message
  const getEncouragingMessage = () => {
    if (progressPercent === 100) return "You're a power user! 🎉";
    if (progressPercent >= 75) return "Almost there! Keep going!";
    if (progressPercent >= 50) return "Great progress! Halfway done.";
    if (progressPercent >= 25) return "Nice start! Keep exploring.";
    return "Start exploring your new app!";
  };

  // Handle tip selection
  const handleTipSelect = (tp: TeachingPoint) => {
    setConfirmationTip(tp);
  };

  // Handle confirmed navigation with spotlight
  const handleConfirmedNavigation = () => {
    if (!confirmationTip) return;
    
    const tp = confirmationTip;
    setConfirmationTip(null);
    
    // Build the navigation URL
    let targetUrl = '/';
    
    if (tp.trigger.page === '/settings') {
      targetUrl = `/settings?section=${tp.trigger.section || 'personal'}`;
    } else if (tp.trigger.page === '/app') {
      targetUrl = `/?tab=${tp.trigger.section || 'dashboard'}`;
    } else if (tp.trigger.page) {
      targetUrl = tp.trigger.page;
    }
    
    navigate(targetUrl);
    
    // After navigation, scroll to element and show spotlight
    setTimeout(() => {
      if (tp.targetSelector) {
        const element = document.querySelector(tp.targetSelector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          setTimeout(() => {
            showSpotlightForTip(tp);
          }, 500);
          return;
        }
      }
      
      toast.info(tp.title, {
        description: tp.description,
        duration: 6000,
      });
      completeTeaching(tp.id);
    }, 300);
  };

  const isAllComplete = progressPercent === 100;

  // Count unlocked badges
  const unlockedBadgesCount = achievementBadges.filter(badge => 
    isBadgeUnlocked(badge, completedTips)
  ).length;

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden shrink-0">
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
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">
                  {completedCount} of {totalCount} tips • {unlockedBadgesCount} badges
                </span>
                <span className="font-medium text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pb-2 shrink-0">
          <TipSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        {/* Contextual Recommendations (when not searching and not on badges tab) */}
        {!searchQuery && contextualTips.length > 0 && activeTab !== 'badges' && (
          <div className="shrink-0">
            <RecommendedTips
              tips={contextualTips}
              onSelect={handleTipSelect}
            />
          </div>
        )}

        {/* Category Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as TabCategory)} 
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="px-3 border-b shrink-0">
            <TabsList variant="segment" className="w-full h-8">
              {TAB_CONFIG.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} variant="segment" className="text-xs">
                  {tab.id === 'badges' ? (
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  ) : (
                    tab.label
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tips List */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              {/* Badges Tab Content */}
              <TabsContent value="badges" className="m-0 p-3">
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Complete tips to unlock achievement badges!
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {achievementBadges.map(badge => {
                      const isUnlocked = isBadgeUnlocked(badge, completedTips);
                      const { completed, total, percent } = getBadgeProgress(badge, completedTips);
                      const Icon = badge.icon;
                      
                      return (
                        <Tooltip key={badge.id}>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={cn(
                                "p-3 rounded-xl border text-center transition-all cursor-default",
                                isUnlocked 
                                  ? `bg-gradient-to-br ${badge.gradient} border-transparent shadow-md` 
                                  : "bg-muted/30 border-border"
                              )}
                            >
                              <div className={cn(
                                "h-10 w-10 mx-auto mb-2 rounded-full flex items-center justify-center",
                                isUnlocked ? "bg-white/20" : "bg-muted"
                              )}>
                                {isUnlocked ? (
                                  <Icon className={cn("h-5 w-5", isUnlocked ? "text-white" : "text-muted-foreground")} />
                                ) : (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              
                              <p className={cn(
                                "text-xs font-medium mb-1 truncate",
                                isUnlocked ? "text-white" : "text-foreground"
                              )}>
                                {badge.name}
                              </p>
                              
                              {!isUnlocked && (
                                <div className="space-y-1">
                                  <Progress value={percent} className="h-1" />
                                  <p className="text-[10px] text-muted-foreground">
                                    {completed}/{total}
                                  </p>
                                </div>
                              )}
                              
                              {isUnlocked && (
                                <div className="flex items-center justify-center gap-1 text-white/80">
                                  <Check className="h-3 w-3" />
                                  <span className="text-[10px]">Unlocked!</span>
                                </div>
                              )}
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="font-medium">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">{badge.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Other Tabs Content */}
              {TAB_CONFIG.filter(t => t.id !== 'badges').map(tab => (
                <TabsContent key={tab.id} value={tab.id} className="m-0 p-2 space-y-1.5">
                  <AnimatePresence mode="popLayout">
                    {isAllComplete && !searchQuery ? (
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
              ))}
            </ScrollArea>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30 space-y-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={restartWelcomeTour}
              className="text-xs gap-1.5"
            >
              <Play className="h-3 w-3" />
              Restart Tour
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setHelpCenterOpen(true)}
              className="text-xs gap-1.5"
            >
              <HelpCircle className="h-3 w-3" />
              Guides
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllTeaching}
              className="text-xs hover:bg-muted h-7 px-2"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset tips
            </Button>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Keyboard className="h-3 w-3" />
              ⌘? to open
            </span>
          </div>
        </div>
      </div>
      
      {/* Help Center Drawer */}
      <HelpCenterDrawer open={helpCenterOpen} onOpenChange={setHelpCenterOpen} />
      
      {/* Tip Confirmation Dialog */}
      <TipConfirmationDialog
        tip={confirmationTip}
        open={!!confirmationTip}
        onOpenChange={(open) => !open && setConfirmationTip(null)}
        onConfirm={handleConfirmedNavigation}
      />
      
      {/* Badge Celebration */}
      <BadgeCelebration
        badge={celebratingBadge}
        open={!!celebratingBadge}
        onClose={() => setCelebratingBadge(null)}
      />
    </TooltipProvider>
  );
};
