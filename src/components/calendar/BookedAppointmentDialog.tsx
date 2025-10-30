import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Video, Calendar, User, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookedAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
}

export const BookedAppointmentDialog = ({ open, onOpenChange, appointment }: BookedAppointmentDialogProps) => {
  const { toast } = useToast();
  
  if (!appointment?.bookingData) return null;
  
  const booking = appointment.bookingData;
  const bookingUrl = `${window.location.origin}/book/${appointment.scheduler_slug}`;
  
  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast({ title: "Link copied!", description: "Booking link copied to clipboard" });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {appointment.scheduler_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{booking.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{booking.customer_email}</span>
            </div>
            {booking.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.customer_phone}</span>
              </div>
            )}
          </div>
          
          {(appointment.video_meeting_link || booking.video_call_link) && (
            <Button variant="outline" className="w-full" asChild>
              <a href={appointment.video_meeting_link || booking.video_call_link} target="_blank" rel="noopener noreferrer">
                <Video className="h-4 w-4 mr-2" />
                Join Video Call
              </a>
            </Button>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Share Booking Page:</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Page
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
