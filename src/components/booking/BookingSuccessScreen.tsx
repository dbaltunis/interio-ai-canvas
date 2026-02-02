import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Mail, Check, CalendarPlus, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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
  company_name?: string;
  company_logo_url?: string;
}

interface BookingSuccessScreenProps {
  scheduler: Scheduler;
  selectedDate: Date;
  selectedTime: string;
  clientInfo: ClientInfo;
}

// Confetti particle component
const ConfettiParticle = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    initial={{ y: -20, x: x, opacity: 1, scale: 1 }}
    animate={{ 
      y: 400, 
      opacity: 0, 
      scale: 0.5,
      rotate: Math.random() * 360 
    }}
    transition={{ 
      duration: 2.5, 
      delay, 
      ease: "easeOut" 
    }}
    className="absolute w-3 h-3 rounded-full"
    style={{ 
      backgroundColor: ['#6366f1', '#8b5cf6', '#a855f7', '#22c55e', '#eab308'][Math.floor(Math.random() * 5)],
      left: `${Math.random() * 100}%`
    }}
  />
);

export const BookingSuccessScreen = ({
  scheduler,
  selectedDate,
  selectedTime,
  clientInfo
}: BookingSuccessScreenProps) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Generate Google Calendar link
  const generateCalendarLink = () => {
    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + scheduler.duration);

    const formatDate = (date: Date) => 
      date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, -1);

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: scheduler.name,
      dates: `${formatDate(startDateTime)}/${formatDate(endDateTime)}`,
      details: `Appointment with ${scheduler.company_name || 'the business'}${scheduler.google_meet_link ? `\n\nMeeting Link: ${scheduler.google_meet_link}` : ''}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiParticle 
              key={i} 
              delay={i * 0.05} 
              x={Math.random() * 100 - 50} 
            />
          ))}
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="max-w-lg w-full bg-background rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Success Header */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center text-white">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="h-10 w-10 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold mb-2"
          >
            Booking Confirmed!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-green-100"
          >
            Your appointment has been scheduled successfully
          </motion.p>
        </div>

        {/* Booking Details */}
        <div className="p-6 space-y-6">
          {/* Company Info */}
          {scheduler.company_name && (
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              {scheduler.company_logo_url ? (
                <img 
                  src={scheduler.company_logo_url} 
                  alt={scheduler.company_name}
                  className="w-12 h-12 rounded-lg object-contain bg-muted p-1"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Appointment with</p>
                <p className="font-semibold text-foreground">{scheduler.company_name}</p>
              </div>
            </div>
          )}

          {/* Appointment Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-semibold text-foreground">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-foreground">{selectedTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-semibold text-foreground">{scheduler.name}</p>
                <p className="text-sm text-foreground">{scheduler.duration} minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booked by</p>
                <p className="font-semibold text-foreground">{clientInfo.name}</p>
                <p className="text-sm text-foreground">{clientInfo.email}</p>
              </div>
            </div>
          </div>

          {/* Meeting Link */}
          {scheduler.google_meet_link && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <p className="font-medium text-blue-800 dark:text-blue-300">Meeting Link</p>
              </div>
              <a 
                href={scheduler.google_meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {scheduler.google_meet_link}
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              asChild
              className="flex-1 h-11"
              variant="default"
            >
              <a href={generateCalendarLink()} target="_blank" rel="noopener noreferrer">
                <CalendarPlus className="w-4 h-4 mr-2" />
                Add to Calendar
              </a>
            </Button>
            <Button
              onClick={() => window.close()}
              variant="outline"
              className="flex-1 h-11"
            >
              Done
            </Button>
          </div>

          {/* Confirmation Notice */}
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 dark:text-green-300">
                A confirmation email has been sent to <strong>{clientInfo.email}</strong>
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                If you need to reschedule or cancel, please contact us directly.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
