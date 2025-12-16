import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TooltipPointer } from '@/components/guides/TooltipPointer';

export const MeasurementMockup = ({ className }: { className?: string }) => {
  return (
    <div className={cn('relative bg-card rounded-xl border border-border/50 p-4 shadow-2xl', className)}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-muted-foreground">Measurement</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Window Diagram */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="relative aspect-[3/4] bg-muted/30 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center">
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs text-primary font-medium">1800mm</div>
          <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-primary font-medium">2400mm</div>
          <div className="text-xs text-muted-foreground">Window</div>
          <TooltipPointer label="Visual diagrams" position="bottom-left" className="absolute -bottom-2 left-1/2 -translate-x-1/2 hidden lg:block" />
        </motion.div>

        {/* Form Fields */}
        <div className="space-y-3">
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="text-xs text-muted-foreground mb-1">Width (mm)</div>
            <div className="bg-muted/50 rounded px-2 py-1.5 text-sm text-foreground">1800</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <div className="text-xs text-muted-foreground mb-1">Drop (mm)</div>
            <div className="bg-muted/50 rounded px-2 py-1.5 text-sm text-foreground">2400</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="relative pt-2 border-t border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Total Price</div>
            <div className="text-lg font-bold text-primary">€1,245.00</div>
            <TooltipPointer label="Real-time pricing" position="right" className="absolute -right-2 top-1/2 hidden lg:block" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
