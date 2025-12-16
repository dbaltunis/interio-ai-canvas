import { motion } from 'framer-motion';
import { Upload, Building2, Grid3X3, Tag, Eye, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShowcaseFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltip: string;
  tooltipPosition: 'left' | 'right';
  delay: number;
  highlight?: boolean;
}

const ShowcaseField = ({ icon, label, value, tooltip, tooltipPosition, delay, highlight }: ShowcaseFieldProps) => (
  <motion.div
    initial={{ opacity: 0, x: tooltipPosition === 'left' ? -20 : 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
    className="relative group"
  >
    {/* Mock field */}
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg border bg-background",
      highlight ? "border-primary ring-2 ring-primary/20" : "border-border"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-md flex items-center justify-center",
        highlight ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
    
    {/* Floating tooltip */}
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: delay + 0.2 }}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-10",
        tooltipPosition === 'left' ? "right-full mr-4" : "left-full ml-4",
        "hidden lg:block"
      )}
    >
      <div className={cn(
        "px-3 py-2 rounded-lg shadow-lg max-w-[180px]",
        highlight ? "bg-primary text-primary-foreground" : "bg-card border border-border"
      )}>
        <p className={cn(
          "text-xs",
          highlight ? "text-primary-foreground" : "text-muted-foreground"
        )}>
          {tooltip}
        </p>
        
        {/* Arrow */}
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 w-0 h-0 border-8 border-transparent",
          tooltipPosition === 'left' 
            ? cn("left-full", highlight ? "border-l-primary" : "border-l-card")
            : cn("right-full", highlight ? "border-r-primary" : "border-r-card")
        )} />
      </div>
    </motion.div>
  </motion.div>
);

export const InteractiveShowcase = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative", className)}>
      {/* Mock app window */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative bg-card rounded-2xl border border-border shadow-2xl shadow-primary/10 overflow-hidden max-w-2xl mx-auto"
      >
        {/* Window header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-muted-foreground ml-2">Upload Pricing Grid</span>
        </div>
        
        {/* Form content */}
        <div className="p-6 space-y-4">
          <ShowcaseField
            icon={<Building2 className="w-4 h-4" />}
            label="Supplier (optional)"
            value="TWC Australia"
            tooltip="Filter grids by supplier for easier management"
            tooltipPosition="right"
            delay={0.1}
          />
          
          <ShowcaseField
            icon={<Grid3X3 className="w-4 h-4" />}
            label="Treatment Type"
            value="Roller Blinds"
            tooltip="Select the product category this grid prices"
            tooltipPosition="left"
            delay={0.2}
          />
          
          <ShowcaseField
            icon={<Tag className="w-4 h-4" />}
            label="Price Group ⭐"
            value="ROLLER-TWC-GROUP1"
            tooltip="⭐ KEY FIELD - Materials with matching price_group will use this grid"
            tooltipPosition="right"
            delay={0.3}
            highlight={true}
          />
          
          <ShowcaseField
            icon={<Eye className="w-4 h-4" />}
            label="Material Match Preview"
            value="✓ 24 materials will match"
            tooltip="See how many inventory items will be priced by this grid"
            tooltipPosition="left"
            delay={0.4}
          />
          
          <ShowcaseField
            icon={<Upload className="w-4 h-4" />}
            label="Grid File"
            value="roller-pricing-2024.csv"
            tooltip="Upload your width × drop pricing matrix"
            tooltipPosition="right"
            delay={0.5}
          />
          
          <ShowcaseField
            icon={<Percent className="w-4 h-4" />}
            label="Markup % (optional)"
            value="25%"
            tooltip="Grid-specific markup overrides category and global defaults"
            tooltipPosition="left"
            delay={0.6}
          />
        </div>
      </motion.div>
      
      {/* Decorative elements */}
      <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
    </div>
  );
};
