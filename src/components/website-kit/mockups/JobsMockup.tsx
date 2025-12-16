import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const columns = [
  { title: 'Quote', color: 'bg-blue-500', jobs: [{ name: 'Thompson Residence', value: '€2,450' }] },
  { title: 'Order', color: 'bg-yellow-500', jobs: [{ name: 'Chen Office', value: '€5,200' }] },
  { title: 'Install', color: 'bg-purple-500', jobs: [{ name: 'Wilson Home', value: '€3,800' }] },
  { title: 'Complete', color: 'bg-green-500', jobs: [] },
];

export const JobsMockup = ({ className }: { className?: string }) => {
  return (
    <div className={cn('relative bg-card rounded-xl border border-border/50 p-4 shadow-2xl', className)}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-muted-foreground">Jobs</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {columns.map((col, i) => (
          <motion.div key={col.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }} className="space-y-2">
            <div className="flex items-center gap-1">
              <div className={cn('w-2 h-2 rounded-full', col.color)} />
              <span className="text-xs font-medium text-foreground">{col.title}</span>
            </div>
            <div className="min-h-[60px] bg-muted/30 rounded-lg p-1.5 space-y-1.5">
              {col.jobs.map(job => (
                <div key={job.name} className="bg-card rounded p-1.5 border border-border/50">
                  <div className="text-xs font-medium text-foreground truncate">{job.name}</div>
                  <div className="text-xs text-primary">{job.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
