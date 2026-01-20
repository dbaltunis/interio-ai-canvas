import { motion } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { Home, Move, Plus } from "lucide-react";

interface SceneProps {
  progress: number;
}

const rooms = [
  { name: "Living Room", x: 15, y: 25, width: 35, height: 30 },
  { name: "Bedroom", x: 55, y: 25, width: 30, height: 30 },
  { name: "Kitchen", x: 15, y: 60, width: 25, height: 25 },
  { name: "Office", x: 45, y: 60, width: 25, height: 25 },
];

const treatments = [
  { emoji: "🪟", name: "Curtains", room: 0 },
  { emoji: "📐", name: "Blinds", room: 1 },
  { emoji: "🎭", name: "Romans", room: 2 },
];

export const QuoteCanvasScene = ({ progress }: SceneProps) => {
  const canvasIn = phaseProgress(progress, 0, 0.25);
  const roomsIn = phaseProgress(progress, 0.15, 0.45);
  const dragEffect = phaseProgress(progress, 0.4, 0.7);
  const totalUpdate = phaseProgress(progress, 0.65, 1);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden">
      {/* Canvas header */}
      <motion.div
        className="absolute top-2 left-2 right-2 flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: canvasIn, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Quote Canvas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="px-2 py-0.5 bg-primary/10 rounded text-[8px] text-primary font-medium">
            4 Rooms
          </div>
        </div>
      </motion.div>

      {/* Floor plan canvas */}
      <div className="absolute inset-0 top-10 bottom-12 m-2">
        <motion.div
          className="relative w-full h-full bg-muted/30 rounded-xl border border-dashed border-border overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: canvasIn }}
        >
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* Rooms */}
          {rooms.map((room, index) => {
            const delay = index * 0.1;
            const roomProgress = phaseProgress(roomsIn, delay, delay + 0.4);
            const hasTreatment = treatments.find(t => t.room === index);
            const treatmentDragging = dragEffect > 0.3 && dragEffect < 0.7 && index === Math.floor(dragEffect * 4);
            
            return (
              <motion.div
                key={room.name}
                className="absolute border-2 border-primary/30 bg-primary/5 rounded-lg"
                style={{
                  left: `${room.x}%`,
                  top: `${room.y}%`,
                  width: `${room.width}%`,
                  height: `${room.height}%`,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: roomProgress,
                  scale: treatmentDragging ? 1.05 : 0.8 + roomProgress * 0.2,
                  borderColor: treatmentDragging ? "hsl(var(--primary))" : undefined,
                }}
              >
                <span className="absolute top-1 left-1 text-[7px] font-medium text-muted-foreground">
                  {room.name}
                </span>
                
                {hasTreatment && dragEffect > 0.5 && (
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    {hasTreatment.emoji}
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* Dragging treatment */}
          {dragEffect > 0.1 && dragEffect < 0.6 && (
            <motion.div
              className="absolute w-10 h-10 rounded-xl bg-card shadow-xl border border-primary flex items-center justify-center"
              initial={{ left: "80%", top: "20%" }}
              animate={{
                left: `${80 - dragEffect * 100}%`,
                top: `${20 + dragEffect * 40}%`,
                rotate: [-5, 5, -5],
              }}
              transition={{ rotate: { repeat: Infinity, duration: 0.3 } }}
            >
              <span className="text-lg">🪟</span>
              <Move className="absolute -top-1 -right-1 w-3 h-3 text-primary" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Treatment picker */}
      <motion.div
        className="absolute bottom-2 left-2 right-2 flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: canvasIn, y: 0 }}
      >
        <div className="flex gap-1.5 flex-1">
          {treatments.map((treatment, index) => (
            <motion.div
              key={treatment.name}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-card rounded-lg border border-border/50 shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-sm">{treatment.emoji}</span>
              <span className="text-[8px] text-muted-foreground hidden sm:block">{treatment.name}</span>
            </motion.div>
          ))}
          <motion.div
            className="w-8 flex items-center justify-center bg-primary/10 rounded-lg border border-primary/20"
            whileHover={{ scale: 1.05 }}
          >
            <Plus className="w-3 h-3 text-primary" />
          </motion.div>
        </div>
        
        {/* Running total */}
        <motion.div
          className="px-3 py-1.5 bg-primary rounded-lg"
          animate={{
            scale: totalUpdate > 0.8 ? [1, 1.05, 1] : 1
          }}
        >
          <motion.span className="text-[10px] font-bold text-primary-foreground">
            ${Math.round(totalUpdate * 3850).toLocaleString()}
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
};
