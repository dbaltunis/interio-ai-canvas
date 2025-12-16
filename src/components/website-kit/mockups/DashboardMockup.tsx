import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipPointer } from '@/components/guides/TooltipPointer';

export const DashboardMockup = ({ className }: { className?: string }) => {
  return (
    <div className={cn('relative bg-card rounded-xl border border-border/50 p-4 shadow-2xl', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-muted-foreground">Dashboard</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative bg-primary/10 rounded-lg p-3">
          <DollarSign className="w-4 h-4 text-primary mb-1" />
          <div className="text-lg font-bold text-foreground">€45,230</div>
          <div className="text-xs text-muted-foreground">Revenue</div>
          <TooltipPointer label="Track revenue in real-time" position="right" className="absolute -right-2 top-1/2 -translate-y-1/2 hidden lg:block" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-muted/50 rounded-lg p-3">
          <Users className="w-4 h-4 text-primary mb-1" />
          <div className="text-lg font-bold text-foreground">127</div>
          <div className="text-xs text-muted-foreground">Active Clients</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-muted/50 rounded-lg p-3">
          <TrendingUp className="w-4 h-4 text-green-500 mb-1" />
          <div className="text-lg font-bold text-foreground">68%</div>
          <div className="text-xs text-muted-foreground">Conversion</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-muted/50 rounded-lg p-3">
          <Calendar className="w-4 h-4 text-primary mb-1" />
          <div className="text-lg font-bold text-foreground">12</div>
          <div className="text-xs text-muted-foreground">This Week</div>
        </motion.div>
      </div>

      {/* Mini Chart */}
      <div className="bg-muted/30 rounded-lg p-3">
        <div className="text-xs text-muted-foreground mb-2">Monthly Revenue</div>
        <div className="flex items-end gap-1 h-12">
          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
            <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.5 + i * 0.1 }} className="flex-1 bg-primary/60 rounded-t" />
          ))}
        </div>
      </div>
    </div>
  );
};
