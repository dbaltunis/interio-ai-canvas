import { motion } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { Package, Calendar, QrCode, Clock } from "lucide-react";

interface SceneProps {
  progress: number;
}

const fabricItems = [
  { name: "Velvet Silver", color: "#9ca3af" },
  { name: "Linen Natural", color: "#d4c4a8" },
  { name: "Cotton White", color: "#f5f5f4" },
  { name: "Silk Ivory", color: "#fef3c7" },
  { name: "Wool Grey", color: "#6b7280" },
  { name: "Sheer Pearl", color: "#e5e7eb" },
];

const appointments = [
  { time: "9:00", title: "Site Measure - Johnson", color: "bg-blue-500" },
  { time: "11:30", title: "Quote Review - Chen", color: "bg-emerald-500" },
  { time: "14:00", title: "Installation - Davis", color: "bg-amber-500" },
];

export const LibraryCalendarScene = ({ progress }: SceneProps) => {
  const gridIn = phaseProgress(progress, 0, 0.4);
  const qrScan = phaseProgress(progress, 0.3, 0.55);
  const calendarIn = phaseProgress(progress, 0.45, 0.8);
  const appointmentsIn = phaseProgress(progress, 0.6, 1);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden flex">
      {/* Library panel */}
      <motion.div
        className="w-1/2 border-r border-border/50 p-2"
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: gridIn, x: 0 }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Package className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Fabric Library</span>
        </div>

        {/* Fabric grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {fabricItems.map((item, index) => {
            const delay = index * 0.06;
            const itemProgress = phaseProgress(gridIn, delay + 0.1, delay + 0.4);
            const isScanned = qrScan > 0.5 && index === 2;
            
            return (
              <motion.div
                key={item.name}
                className={`relative rounded-lg overflow-hidden aspect-square ${
                  isScanned ? 'ring-2 ring-primary' : ''
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: itemProgress,
                  scale: 0.8 + itemProgress * 0.2
                }}
              >
                <div 
                  className="absolute inset-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[6px] text-white font-medium truncate">
                  {item.name}
                </span>
                
                {isScanned && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-primary/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <QrCode className="w-4 h-4 text-primary" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* QR Scanner beam */}
        {qrScan > 0.2 && qrScan < 0.7 && (
          <motion.div
            className="absolute left-2 right-1/2 top-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"
              animate={{ 
                y: [-20, 20, -20],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Calendar panel */}
      <motion.div
        className="w-1/2 p-2"
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: calendarIn, x: 0 }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Today</span>
        </div>

        {/* Appointments */}
        <div className="space-y-1.5">
          {appointments.map((apt, index) => {
            const delay = index * 0.12;
            const aptProgress = phaseProgress(appointmentsIn, delay, delay + 0.35);
            
            return (
              <motion.div
                key={apt.time}
                className="flex items-stretch gap-1.5 bg-card rounded-lg border border-border/50 overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: aptProgress,
                  y: 10 - aptProgress * 10
                }}
              >
                <div className={`w-1 ${apt.color}`} />
                <div className="flex-1 py-1.5 pr-1.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-[8px] font-medium text-muted-foreground">{apt.time}</span>
                  </div>
                  <p className="text-[9px] font-medium text-foreground truncate">{apt.title}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Time indicator */}
        <motion.div
          className="mt-2 flex items-center gap-1 text-[8px] text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: appointmentsIn }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>3 appointments today</span>
        </motion.div>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary/5"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  );
};
