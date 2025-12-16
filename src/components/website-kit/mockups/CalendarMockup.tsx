import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const events = [
  { day: 0, time: '09:00', title: 'Measure', color: 'bg-blue-500' },
  { day: 1, time: '14:00', title: 'Install', color: 'bg-green-500' },
  { day: 3, time: '10:00', title: 'Consult', color: 'bg-purple-500' },
];

export const CalendarMockup = ({ className }: { className?: string }) => {
  return (
    <div className={cn('relative bg-card rounded-xl border border-border/50 p-4 shadow-2xl', className)}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-muted-foreground">Calendar</span>
      </div>

      <div className="grid grid-cols-5 gap-1 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-xs text-muted-foreground py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-1">
        {days.map((_, dayIndex) => (
          <div key={dayIndex} className="min-h-[60px] bg-muted/20 rounded p-1">
            {events.filter(e => e.day === dayIndex).map(event => (
              <motion.div key={event.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + dayIndex * 0.1 }} className={cn('text-xs p-1 rounded text-white mb-1', event.color)}>
                <div className="font-medium truncate">{event.title}</div>
                <div className="opacity-75">{event.time}</div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3 pt-2 border-t border-border/50">
        <span className="text-xs bg-muted/50 px-2 py-0.5 rounded text-muted-foreground">Google</span>
        <span className="text-xs bg-muted/50 px-2 py-0.5 rounded text-muted-foreground">Outlook</span>
      </div>
    </div>
  );
};
