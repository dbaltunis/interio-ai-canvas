import { motion } from 'framer-motion';
import { FileText, Send, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export const QuotesMockup = ({ className }: { className?: string }) => {
  return (
    <div className={cn('relative bg-card rounded-xl border border-border/50 p-4 shadow-2xl', className)}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-muted-foreground">Quote #Q-2024-0127</span>
      </div>

      <div className="space-y-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-between text-xs">
          <span className="text-muted-foreground">Client:</span>
          <span className="text-foreground font-medium">Thompson Residence</span>
        </motion.div>

        <div className="border-t border-border/50 pt-2 space-y-1.5">
          {[{ item: 'Roller Blinds x 3', price: '€1,245' }, { item: 'Roman Blinds x 2', price: '€890' }, { item: 'Installation', price: '€315' }].map((line, i) => (
            <motion.div key={line.item} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{line.item}</span>
              <span className="text-foreground">{line.price}</span>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="border-t border-border/50 pt-2 flex justify-between">
          <span className="text-sm font-medium text-foreground">Total</span>
          <span className="text-sm font-bold text-primary">€2,450.00</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex gap-2 pt-2">
          <button className="flex-1 flex items-center justify-center gap-1 bg-primary text-primary-foreground text-xs py-1.5 rounded">
            <Send className="w-3 h-3" /> Send
          </button>
          <button className="flex items-center justify-center gap-1 bg-muted text-foreground text-xs py-1.5 px-3 rounded">
            <Download className="w-3 h-3" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};
