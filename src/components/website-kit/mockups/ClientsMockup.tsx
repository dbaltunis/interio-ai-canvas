import { motion } from 'framer-motion';
import { Search, Star, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const clients = [
  { name: 'Sarah Johnson', status: 'VIP', email: 'sarah@email.com', score: 95 },
  { name: 'Michael Chen', status: 'Active', email: 'michael@email.com', score: 78 },
  { name: 'Emma Wilson', status: 'Lead', email: 'emma@email.com', score: 45 },
];

export const ClientsMockup = ({ className }: { className?: string }) => {
  return (
    <div className={cn('relative bg-card rounded-xl border border-border/50 p-4 shadow-2xl', className)}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-muted-foreground">Clients</span>
      </div>

      <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-muted/50 rounded-lg">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Search clients...</span>
      </div>

      <div className="space-y-2">
        {clients.map((client, i) => (
          <motion.div key={client.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.1 }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
              {client.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{client.name}</div>
              <div className="text-xs text-muted-foreground truncate">{client.email}</div>
            </div>
            <div className={cn('text-xs px-2 py-0.5 rounded-full', client.status === 'VIP' ? 'bg-primary/20 text-primary' : client.status === 'Active' ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground')}>
              {client.status}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
