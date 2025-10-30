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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Available Appointment Slot
          </DialogTitle>
          <DialogDescription>
            Share this booking link with your clients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Slot Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{slot.schedulerName}</h3>
              <Badge variant="secondary">Available</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(slot.date, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{slot.startTime} - {slot.endTime}</span>
                <span className="text-muted-foreground">({slot.duration} min)</span>
              </div>
            </div>
          </div>

          {/* Booking Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Booking Link</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted rounded-md px-3 py-2 text-sm font-mono truncate">
                {bookingUrl}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={copyLink}
              variant="outline"
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            
            <Button 
              onClick={openBookingPage}
              className="flex-1 bg-brand-primary hover:bg-brand-accent text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Page
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Share this link via email, SMS, or social media to let clients book this time slot
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};