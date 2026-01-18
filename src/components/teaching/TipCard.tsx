import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Clock, Settings, Lightbulb, Sparkles, Package, Users, FileText, Calendar, Mail, PieChart, Warehouse, Calculator } from 'lucide-react';
import { TeachingPoint } from '@/config/teachingPoints';
import { cn } from '@/lib/utils';

interface TipCardProps {
  tip: TeachingPoint;
  isSeen: boolean;
  isDismissed: boolean;
  onSelect: (tip: TeachingPoint) => void;
  index?: number;
}

const getCategoryIcon = (category: string, section?: string) => {
  // Map sections to icons
  const sectionIcons: Record<string, React.ElementType> = {
    dashboard: Sparkles,
    clients: Users,
    projects: FileText,
    calendar: Calendar,
    emails: Mail,
    crm: PieChart,
    inventory: Warehouse,
    calculator: Calculator,
    library: Package,
    personal: Settings,
    business: Settings,
    units: Settings,
    products: Package,
    markup: Settings,
    team: Users,
    documents: FileText,
    system: Settings,
    alerts: Settings,
    integrations: Settings,
  };
  
  if (section && sectionIcons[section]) {
    return sectionIcons[section];
  }
  
  // Default by category
  if (category === 'settings') return Settings;
  if (category === 'app') return Sparkles;
  return Lightbulb;
};

const getEstimatedTime = (priority: string): string => {
  switch (priority) {
    case 'high': return '2 min';
    case 'medium': return '1 min';
    case 'low': return '30 sec';
    default: return '1 min';
  }
};

export const TipCard: React.FC<TipCardProps> = ({
  tip,
  isSeen,
  isDismissed,
  onSelect,
  index = 0,
}) => {
  const Icon = getCategoryIcon(tip.category, tip.trigger.section);
  const estimatedTime = getEstimatedTime(tip.priority);
  
  return (
    <motion.button
      onClick={() => onSelect(tip)}
      disabled={isDismissed}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "w-full text-left p-3 rounded-xl border transition-all duration-200 group",
        "hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm",
        isSeen 
          ? "border-border/50 bg-muted/20" 
          : "border-border bg-card",
        isDismissed && "opacity-40 cursor-not-allowed pointer-events-none"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon with completion state */}
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
          isSeen 
            ? "bg-primary/10 text-primary" 
            : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
        )}>
          {isSeen ? (
            <Check className="w-4 h-4" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className={cn(
              "font-medium text-sm truncate",
              isSeen ? "text-muted-foreground" : "text-foreground"
            )}>
              {tip.title}
            </h4>
          </div>
          
          <p className={cn(
            "text-xs line-clamp-2 mb-2",
            isSeen ? "text-muted-foreground/70" : "text-muted-foreground"
          )}>
            {tip.description}
          </p>

          {/* Footer with time and CTA */}
          <div className="flex items-center justify-between">
            <span className={cn(
              "flex items-center gap-1 text-[10px]",
              isSeen ? "text-muted-foreground/50" : "text-muted-foreground"
            )}>
              <Clock className="w-3 h-3" />
              {estimatedTime}
            </span>
            
            {!isSeen && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                View
                <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default TipCard;
