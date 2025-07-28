import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useScheduler } from "@/hooks/useScheduler";
import { Copy, ExternalLink, Calendar, Clock, User, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface AvailableSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  slot: {
    id: string;
    schedulerName: string;
    schedulerSlug?: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
  } | null;
}

export const AvailableSlotDialog = ({ isOpen, onClose, slot }: AvailableSlotDialogProps) => {
  const { toast } = useToast();
  const { data: scheduler, isLoading } = useScheduler(slot?.schedulerName || "");

  if (!slot) return null;

  // Generate booking URL using the actual scheduler slug from database
  const baseBookingUrl = scheduler?.slug 
    ? `${window.location.origin}/book/${scheduler.slug}`
    : `${window.location.origin}/book/scheduler`;
  
  const copyBookingLink = () => {
    navigator.clipboard.writeText(baseBookingUrl);
    toast({
      title: "Link Copied",
      description: "Booking link copied to clipboard",
    });
  };

  const shareViaEmail = () => {
    const subject = `Book an appointment: ${slot.schedulerName}`;
    const body = `Hi,

I'd like to share this appointment booking link with you:

📅 ${slot.schedulerName}
🕐 ${slot.duration} minutes
📍 Available slots starting ${format(new Date(slot.date), 'EEEE, MMMM d, yyyy')}

You can book directly at: ${baseBookingUrl}

Best regards`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const openBookingPage = () => {
    window.open(baseBookingUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Available Appointment Slot
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading scheduler details...</span>
            </div>
          )}
          
          {/* Slot Details */}
          {!isLoading && (
            <>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{slot.schedulerName}</span>
                  {scheduler?.description && (
                    <span className="text-sm text-muted-foreground">- {scheduler.description}</span>
                  )}
                </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{format(new Date(slot.date), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{slot.startTime} - {slot.endTime} ({slot.duration} min)</span>
            </div>
          </div>

          {/* Booking Link */}
          <div className="space-y-3">
            <Label>Public Booking Link</Label>
            <div className="flex gap-2">
              <Input 
                value={baseBookingUrl} 
                readOnly 
                className="text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyBookingLink}
                className="flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link with anyone to let them book "{slot.schedulerName}" appointments
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={openBookingPage}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Booking Page
            </Button>
            
            <Button 
              variant="outline"
              onClick={shareViaEmail}
              className="w-full"
            >
              Share via Email
            </Button>
          </div>

          {/* Multiple Schedulers Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>💡 About this appointment type:</strong> "{slot.schedulerName}" has its own dedicated booking page. 
              Customers can see all available time slots and book directly through the shared link.
            </p>
            {scheduler && (
              <div className="mt-2 text-xs text-blue-700">
                <p>• Duration: {scheduler.duration} minutes</p>
                <p>• Buffer time: {scheduler.buffer_time} minutes</p>
                <p>• Advance booking: up to {scheduler.max_advance_booking} days</p>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};