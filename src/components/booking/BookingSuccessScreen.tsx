import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Mail, Check } from "lucide-react";
import { format } from "date-fns";

interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
  timezone: string;
}

interface Scheduler {
  name: string;
  duration: number;
  google_meet_link?: string;
}

interface BookingSuccessScreenProps {
  scheduler: Scheduler;
  selectedDate: Date;
  selectedTime: string;
  clientInfo: ClientInfo;
}

export const BookingSuccessScreen = ({
  scheduler,
  selectedDate,
  selectedTime,
  clientInfo
}: BookingSuccessScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Booking Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3">Your Appointment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span><strong>Service:</strong> {scheduler.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span><strong>Date & Time:</strong> {format(selectedDate, 'PPPP')} at {selectedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                <span><strong>Duration:</strong> {scheduler.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-600" />
                <span><strong>Customer:</strong> {clientInfo.name} ({clientInfo.email})</span>
              </div>
            </div>
          </div>

          {scheduler.google_meet_link && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Meeting Link</h4>
              <a 
                href={scheduler.google_meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm break-all"
              >
                {scheduler.google_meet_link}
              </a>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>A confirmation email has been sent to <strong>{clientInfo.email}</strong></p>
            <p className="mt-2">If you need to reschedule or cancel, please contact us directly.</p>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={() => window.close()} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};