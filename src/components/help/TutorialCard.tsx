import React from 'react';
import { motion } from 'framer-motion';
import { Play, Check, Clock, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Tutorial } from '@/config/tutorials';
import { cn } from '@/lib/utils';

interface TutorialCardProps {
  tutorial: Tutorial;
  isCompleted: boolean;
  onStart: () => void;
  index?: number;
}

export const TutorialCard: React.FC<TutorialCardProps> = ({
  tutorial,
  isCompleted,
  onStart,
  index = 0,
}) => {
  // Dynamically get icon component
  const IconComponent = (Icons as any)[tutorial.icon] || Icons.BookOpen;

  return (
    <motion.button
      className={cn(
        'w-full text-left p-4 rounded-lg border transition-all duration-200',
        'hover:border-primary/50 hover:bg-accent/50',
        isCompleted 
          ? 'border-primary/20 bg-primary/5' 
          : 'border-border bg-card'
      )}
      onClick={onStart}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          isCompleted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        )}>
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground truncate">
              {tutorial.title}
            </h4>
            {isCompleted && (
              <div className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-3 h-3 text-primary" />
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {tutorial.description}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {tutorial.estimatedTime}
            </span>
            <span className="flex items-center gap-1">
              {tutorial.steps.length} steps
            </span>
          </div>
        </div>

        {/* Play button */}
        <div className={cn(
          'shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
          'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
        )}>
          {isCompleted ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </div>
      </div>
    </motion.button>
  );
};

export const TutorialCardSkeleton: React.FC = () => {
  return (
    <div className="w-full p-4 rounded-lg border border-border bg-card animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted" />
        <div className="flex-1">
          <div className="h-5 w-3/4 bg-muted rounded mb-2" />
          <div className="h-4 w-full bg-muted rounded mb-2" />
          <div className="h-3 w-1/4 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
};
