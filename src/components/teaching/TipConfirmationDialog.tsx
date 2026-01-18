import React from 'react';
import { MapPin, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TeachingPoint } from '@/config/teachingPoints';
import { motion } from 'framer-motion';

interface TipConfirmationDialogProps {
  tip: TeachingPoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * Confirmation dialog shown before navigating to a tip's target location.
 * Allows user to see where they'll be taken before committing.
 */
export const TipConfirmationDialog = ({
  tip,
  open,
  onOpenChange,
  onConfirm,
}: TipConfirmationDialogProps) => {
  if (!tip) return null;

  // Build human-readable destination
  const getDestination = () => {
    if (tip.trigger.page === '/settings') {
      const section = tip.trigger.section || 'personal';
      const sectionName = section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ');
      return `Settings → ${sectionName}`;
    }
    if (tip.trigger.page === '/app') {
      const section = tip.trigger.section || 'dashboard';
      const sectionName = section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ');
      return `App → ${sectionName}`;
    }
    if (tip.trigger.page) {
      return tip.trigger.page.replace('/', '').charAt(0).toUpperCase() + 
             tip.trigger.page.slice(2).replace(/-/g, ' ');
    }
    return 'Dashboard';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">{tip.title}</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Interactive walkthrough
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            {tip.description}
          </p>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
            <span className="text-xs text-muted-foreground">Destination:</span>
            <span className="text-sm font-medium">{getDestination()}</span>
          </div>
          
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary" />
            </motion.div>
            <span>
              We'll navigate you to the right page, scroll to the element, 
              and highlight where to click.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} className="gap-2">
            Show Me
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
