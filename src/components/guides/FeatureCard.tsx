import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor?: string;
  className?: string;
}

export const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  accentColor = 'primary',
  className 
}: FeatureCardProps) => {
  return (
    <div className={cn(
      "group relative bg-card rounded-xl p-6 border border-border/50",
      "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
      "transition-all duration-300 ease-out",
      className
    )}>
      {/* Icon container */}
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
        "bg-primary/10 text-primary",
        "group-hover:bg-primary group-hover:text-primary-foreground",
        "transition-colors duration-300"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      
      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};
