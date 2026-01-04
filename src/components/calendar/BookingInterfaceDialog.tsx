import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface BookingInterfaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedulerId: string;
  schedulerName: string;
  date: Date;
  availableSlots: Array<{
    id: string;
    startTime: string;
    endTime: string;
    duration: number;
  }>;
}

export const BookingInterfaceDialog = ({
  open,
  onOpenChange,
  schedulerId,
  schedulerName,
  date,
  availableSlots
}: BookingInterfaceDialogProps) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot || !customerName || !customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const slot = availableSlots.find(s => s.id === selectedSlot);
      if (!slot) throw new Error("Slot not found");

      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          scheduler_id: schedulerId,
          appointment_date: format(date, 'yyyy-MM-dd'),
          appointment_time: slot.startTime,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || undefined,
          notes: notes || undefined,
        }
      });

      if (error) throw error;

      // Invalidate all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['scheduler-slots'] }),
        queryClient.invalidateQueries({ queryKey: ['booked-appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
      ]);

      toast({
        title: "Booking Confirmed!",
        description: `Your appointment with ${schedulerName} is confirmed for ${format(date, 'MMM d, yyyy')} at ${slot.startTime}`,
      });

      // Reset form and close dialog
      setSelectedSlot(null);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setNotes("");
      onOpenChange(false);

    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base">Book Appointment</DialogTitle>
          <DialogDescription className="text-xs">
            {schedulerName} • {format(date, 'EEE, MMM d')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Available Time Slots - Compact */}
          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Select Time
            </Label>
            <div className="grid grid-cols-4 gap-1.5">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.id}
                  type="button"
                  variant={selectedSlot === slot.id ? "default" : "outline"}
                  className="h-auto py-2 flex flex-col items-center text-xs"
                  onClick={() => setSelectedSlot(slot.id)}
                >
                  <span className="font-medium">{slot.startTime}</span>
                  <span className="text-[10px] opacity-70">{slot.duration}m</span>
                </Button>
              ))}
            </div>
            {availableSlots.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">
                No slots available
              </p>
            )}
          </div>

          {/* Customer Information - Compact */}
          <div className="space-y-3 pt-3 border-t border-border/50">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <User className="w-3 h-3" />
              Your Information
            </Label>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Name *</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes" className="text-xs">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional info..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>
          </div>

          {/* Submit Button - Compact */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-8"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-8"
              disabled={isSubmitting || !selectedSlot}
            >
              {isSubmitting ? "Booking..." : "Confirm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
