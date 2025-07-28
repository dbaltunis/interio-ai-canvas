import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Mail, Phone, User, Check } from "lucide-react";
import { useCreateBooking } from "@/hooks/useAppointmentBookings";
import { useToast } from "@/hooks/use-toast";
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
  const createBooking = useCreateBooking();
  
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [step, setStep] = useState(1); // 1: form, 2: confirmation

  const handleSubmitBooking = async () => {
    if (!slot || !clientInfo.name || !clientInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Extract scheduler ID from slot ID (format: schedulerId-date-time)
      const schedulerId = slot.id.split('-')[0];
      
      await createBooking.mutateAsync({
        scheduler_id: schedulerId,
        appointment_date: slot.date,
        appointment_time: slot.startTime,
        customer_name: clientInfo.name,
        customer_email: clientInfo.email,
        customer_phone: clientInfo.phone || undefined,
        notes: clientInfo.notes || undefined,
        location_type: 'video_call',
        customer_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        appointment_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: 'confirmed'
      });

      setStep(2);
      toast({
        title: "Booking Confirmed! 🎉",
        description: "You will receive a confirmation email shortly.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setStep(1);
    setClientInfo({ name: "", email: "", phone: "", notes: "" });
    onClose();
  };

  if (!slot) return null;

  if (step === 2) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl text-green-800">Booking Confirmed!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3">Your Appointment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span><strong>Service:</strong> {slot.schedulerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span><strong>Date & Time:</strong> {format(new Date(slot.date), 'PPPP')} at {slot.startTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span><strong>Duration:</strong> {slot.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-600" />
                  <span><strong>Customer:</strong> {clientInfo.name} ({clientInfo.email})</span>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>A confirmation email has been sent to <strong>{clientInfo.email}</strong></p>
              <p className="mt-2">If you need to reschedule or cancel, please contact us directly.</p>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleClose} className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book Appointment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Appointment Details */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">Appointment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span><strong>Service:</strong> {slot.schedulerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span><strong>Date & Time:</strong> {format(new Date(slot.date), 'PPPP')} at {slot.startTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span><strong>Duration:</strong> {slot.duration} minutes</span>
              </div>
            </div>
          </div>

          {/* Client Information Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={clientInfo.name}
                onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={clientInfo.email}
                onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={clientInfo.phone}
                onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={clientInfo.notes}
                onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                placeholder="Any additional information or questions..."
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBooking}
              disabled={!clientInfo.name || !clientInfo.email || createBooking.isPending}
              className="flex-1"
            >
              {createBooking.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Book Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};