import { Clock, Video, MapPin, Calendar, Shield, Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface BookingBrandingPanelProps {
  scheduler: {
    name: string;
    description?: string;
    duration: number;
    image_url?: string;
    locations?: any;
    company_name?: string;
    company_logo_url?: string;
    company_phone?: string;
    company_address?: string;
  };
  selectedDate?: Date;
  selectedTime?: string;
}

export const BookingBrandingPanel = ({ 
  scheduler, 
  selectedDate, 
  selectedTime 
}: BookingBrandingPanelProps) => {
  const getLocationDisplay = () => {
    if (!scheduler.locations) return null;
    if (typeof scheduler.locations === 'object') {
      if (scheduler.locations.video) return { icon: Video, text: "Video Call" };
      if (scheduler.locations.inPerson) return { icon: MapPin, text: scheduler.locations.address || "In Person" };
      if (scheduler.locations.phone) return { icon: MapPin, text: "Phone Call" };
    }
    return null;
  };

  const location = getLocationDisplay();

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-white p-8 lg:p-10 rounded-none lg:rounded-l-2xl flex flex-col justify-between min-h-[300px] lg:min-h-full"
    >
      {/* Company Branding */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          {scheduler.company_logo_url ? (
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              src={scheduler.company_logo_url} 
              alt={scheduler.company_name || "Company"}
              className="w-20 h-20 rounded-xl object-contain bg-white/20 backdrop-blur-sm p-2 shadow-lg"
            />
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
            >
              <Building2 className="w-10 h-10 text-white/80" />
            </motion.div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-white/90">
              {scheduler.company_name || "Schedule with us"}
            </h2>
            {scheduler.company_phone && (
              <p className="text-sm text-white/70">{scheduler.company_phone}</p>
            )}
          </div>
        </div>

        {/* Scheduler Info */}
        <div className="pt-4 border-t border-white/10">
          {scheduler.image_url && (
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              src={scheduler.image_url} 
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-white/20 mb-4"
            />
          )}
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">{scheduler.name}</h1>
          {scheduler.description && (
            <p className="text-white/80 text-sm leading-relaxed">
              {scheduler.description}
            </p>
          )}
        </div>

        {/* Appointment Details */}
        <div className="space-y-3 pt-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 text-white/90"
          >
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-white/70">Duration</p>
              <p className="font-medium">{scheduler.duration} minutes</p>
            </div>
          </motion.div>

          {location && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 text-white/90"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <location.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/70">Location</p>
                <p className="font-medium">{location.text}</p>
              </div>
            </motion.div>
          )}

          {selectedDate && selectedTime && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-white/90 bg-white/10 rounded-lg p-3"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/70">Selected Time</p>
                <p className="font-medium">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedTime}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Trust Signal */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-2 text-white/60 text-sm mt-8 pt-4 border-t border-white/10"
      >
        <Shield className="w-4 h-4" />
        <span>Secure booking powered by InterioApp</span>
      </motion.div>
    </motion.div>
  );
};
