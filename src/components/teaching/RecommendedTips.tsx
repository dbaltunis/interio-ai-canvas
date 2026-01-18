import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { TeachingPoint } from '@/config/teachingPoints';
import { cn } from '@/lib/utils';

interface RecommendedTipsProps {
  tips: TeachingPoint[];
  onSelect: (tip: TeachingPoint) => void;
}

export const RecommendedTips: React.FC<RecommendedTipsProps> = ({
  tips,
  onSelect,
}) => {
  if (tips.length === 0) return null;
  
  // Show max 2 recommendations
  const displayTips = tips.slice(0, 2);

  return (
    <div className="px-3 pt-3 pb-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="h-3 w-3 text-amber-500" />
        <span className="text-xs font-medium text-muted-foreground">Recommended for you</span>
      </div>
      
      <div className="space-y-2">
        {displayTips.map((tip, index) => (
          <motion.button
            key={tip.id}
            onClick={() => onSelect(tip)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 2 }}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-lg text-left",
              "bg-gradient-to-r from-amber-500/10 to-orange-500/5",
              "border border-amber-500/20",
              "hover:border-amber-500/40 hover:from-amber-500/15 hover:to-orange-500/10",
              "transition-all duration-200"
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {tip.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {tip.description}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-amber-500 shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default RecommendedTips;
