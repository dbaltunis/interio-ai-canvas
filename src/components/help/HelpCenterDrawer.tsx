import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, BookOpen, Calendar, FileText, Settings, Package, Rocket, HelpCircle, ExternalLink } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tutorials, tutorialCategories, getTutorialsByCategory, Tutorial } from '@/config/tutorials';
import { TutorialCard } from './TutorialCard';
import { useTutorial } from '@/contexts/TutorialContext';
import { cn } from '@/lib/utils';

interface HelpCenterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  'getting-started': Rocket,
  'calendar': Calendar,
  'quotes': FileText,
  'settings': Settings,
  'inventory': Package,
};

export const HelpCenterDrawer: React.FC<HelpCenterDrawerProps> = ({
  open,
  onOpenChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { startTutorial, isTutorialCompleted } = useTutorial();

  const handleStartTutorial = (tutorial: Tutorial) => {
    onOpenChange(false);
    // Small delay to let drawer close
    setTimeout(() => {
      startTutorial(tutorial.id);
    }, 300);
  };

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = searchQuery === '' || 
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || tutorial.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const completedCount = tutorials.filter(t => isTutorialCompleted(t.id)).length;
  const progressPercentage = (completedCount / tutorials.length) * 100;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg p-0 flex flex-col"
        data-tutorial="help-drawer"
      >
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg">Help Center</SheetTitle>
                <p className="text-xs text-muted-foreground">
                  Tutorials & guides to help you get started
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Your progress</span>
              <span className="font-medium text-foreground">
                {completedCount}/{tutorials.length} completed
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </SheetHeader>

        {/* Search */}
        <div className="px-6 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-6 py-3 border-b border-border overflow-x-auto">
          <div className="flex gap-2">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
              className="shrink-0"
            >
              All
            </Button>
            {tutorialCategories.map(category => {
              const Icon = categoryIcons[category.id] || BookOpen;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className="shrink-0 gap-1.5"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Tutorial list */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredTutorials.length > 0 ? (
                filteredTutorials.map((tutorial, index) => (
                  <TutorialCard
                    key={tutorial.id}
                    tutorial={tutorial}
                    isCompleted={isTutorialCompleted(tutorial.id)}
                    onStart={() => handleStartTutorial(tutorial)}
                    index={index}
                  />
                ))
              ) : (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    No tutorials found matching "{searchQuery}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Need more help?
            </p>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              View Documentation
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
