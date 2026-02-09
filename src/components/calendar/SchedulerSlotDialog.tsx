import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Copy, ExternalLink, Link2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface SchedulerSlot {
  id: string;
  schedulerId: string;
  schedulerName: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  isBooked: boolean;
  slug?: string;
}

interface SchedulerSlotDialogProps {
  slot: SchedulerSlot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SchedulerSlotDialog = ({ slot, open, onOpenChange }: SchedulerSlotDialogProps) => {
  const { toast } = useToast();

  if (!slot) return null;

  // Safely parse the date
  const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
  
  // Validate the date
  if (isNaN(slotDate.getTime())) {
    return null;
  }

  const bookingUrl = `${window.location.origin}/book/${slot.slug || 'scheduler'}`;

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast({
      title: "Link Copied",
      description: "Booking link copied to clipboard",
    });
  };

  const openBookingPage = () => {
    window.open(bookingUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-1.5 text-sm">
            <Link2 className="h-4 w-4 text-primary" />
            Available Slot
          </DialogTitle>
          <DialogDescription className="text-xs">
            Share this booking link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Slot Details - Compact */}
          <div className="bg-muted/50 rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">{slot.schedulerName}</h3>
              <Badge variant="secondary" className="text-[10px] h-5">Available</Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(slotDate, 'EEE, MMM d')}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{slot.startTime} - {slot.endTime}</span>
                <span>({slot.duration}m)</span>
              </div>
            </div>
          </div>

          {/* Booking Link - Compact */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Booking Link</label>
            <div className="bg-muted rounded-md px-2 py-1.5 text-xs font-mono truncate">
              {bookingUrl}
            </div>
          </div>

          {/* Actions - Compact */}
          <div className="flex gap-2">
            <Button 
              onClick={copyLink}
              variant="outline"
              className="flex-1 h-8 text-xs"
            >
              <Copy className="h-3 w-3 mr-1.5" />
              Copy
            </Button>
            
            <Button 
              onClick={openBookingPage}
              className="flex-1 h-8 text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1.5" />
              Open
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};