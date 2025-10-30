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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book Appointment</DialogTitle>
          <DialogDescription>
            Schedule with {schedulerName} on {format(date, 'EEEE, MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Available Time Slots */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Select Time
            </Label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.id}
                  type="button"
                  variant={selectedSlot === slot.id ? "default" : "outline"}
                  className="h-auto py-3 flex flex-col items-center"
                  onClick={() => setSelectedSlot(slot.id)}
                >
                  <span className="font-semibold">{slot.startTime}</span>
                  <span className="text-xs opacity-70">{slot.duration} min</span>
                </Button>
              ))}
            </div>
            {availableSlots.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No available time slots for this date
              </p>
            )}
          </div>

          {/* Customer Information */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Your Information
            </Label>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information..."
                rows={3}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !selectedSlot}
            >
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
