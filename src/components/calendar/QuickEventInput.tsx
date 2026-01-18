import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { format, addHours } from "date-fns";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface QuickEventInputProps {
  date: Date;
  time: string;
  onClose: () => void;
  onSuccess?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export const QuickEventInput = ({
  date,
  time,
  onClose,
  onSuccess,
  style,
  className
}: QuickEventInputProps) => {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();

  // Auto-focus when mounted
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      onClose();
      return;
    }

    try {
      // Parse time and create 1-hour event by default
      const [hours, minutes] = time.split(':').map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = addHours(startTime, 1);

      await createAppointment.mutateAsync({
        title: title.trim(),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        appointment_type: 'meeting',
      } as any);

      toast({
        title: "Event created",
        description: `"${title.trim()}" at ${format(startTime, 'h:mm a')}`,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create quick event:', error);
      toast({
        title: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "absolute left-1 right-1 z-30 pointer-events-auto",
          className
        )}
        style={style}
      >
        <div className="bg-background border-l-4 border-primary rounded-r-md shadow-lg overflow-hidden">
          <div className="p-1.5">
            <div className="text-[9px] text-muted-foreground mb-0.5">
              {format(date, 'EEE, MMM d')} at {time}
            </div>
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                // Small delay to allow click events to register
                setTimeout(() => {
                  if (!title.trim()) onClose();
                  else handleSubmit();
                }, 100);
              }}
              placeholder="Add title and press Enter"
              className="h-6 text-xs border-0 p-0 focus-visible:ring-0 bg-transparent"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
