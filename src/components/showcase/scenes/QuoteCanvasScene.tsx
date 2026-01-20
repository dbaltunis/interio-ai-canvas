import { motion, AnimatePresence } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { 
  Home, ChevronDown, ChevronRight, Edit2, MoreVertical, 
  Plus, Trash2, ExternalLink, DollarSign, Layers, Check,
  Ruler, Palette, Package
} from "lucide-react";

interface SceneProps {
  progress: number;
}

// Room data matching real RoomHeader component
const rooms = [
  { 
    name: "Living Room", 
    total: "$2,450.90",
    windows: [
      { name: "Bay Window", treatment: "Sheer Curtains", fabric: "Premium Linen", dims: "2400 x 2100", price: "$1,247.50", color: "bg-amber-200" },
      { name: "Side Window", treatment: "Roller Blind", fabric: "Blockout White", dims: "1200 x 1800", price: "$485.00", color: "bg-slate-300" },
    ]
  },
  { 
    name: "Master Bedroom", 
    total: "$1,850.00",
    windows: [
      { name: "Main Window", treatment: "Blockout Curtains", fabric: "Velvet Charcoal", dims: "1800 x 2100", price: "$1,120.00", color: "bg-zinc-600" },
    ]
  },
];

export const QuoteCanvasScene = ({ progress }: SceneProps) => {
  const headerIn = phaseProgress(progress, 0, 0.12);
  const room1In = phaseProgress(progress, 0.08, 0.35);
  const windowsIn = phaseProgress(progress, 0.3, 0.55);
  const room2In = phaseProgress(progress, 0.5, 0.7);
  const addRoomIn = phaseProgress(progress, 0.65, 0.85);
  const totalIn = phaseProgress(progress, 0.8, 1);

  // Calculate quote total
  const quoteTotal = rooms.reduce((sum, room) => {
    const roomTotal = parseFloat(room.total.replace(/[$,]/g, ''));
    return sum + roomTotal;
  }, 0);

  return (
    <div className="relative w-full h-full bg-background overflow-hidden flex flex-col">
      {/* Header - matching real JobDetailHeader */}
      <motion.div 
        className="p-2 border-b border-border bg-card/50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: headerIn, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Home className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[11px] font-semibold">Sarah Johnson</h3>
                <span className="text-[9px] text-muted-foreground">P-1234</span>
              </div>
              <p className="text-[8px] text-muted-foreground">Living Room Renovation</p>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Quote Sent
          </span>
        </div>
      </motion.div>

      {/* Rooms list */}
      <div className="flex-1 p-2 space-y-2 overflow-auto">
        {rooms.map((room, roomIndex) => {
          const roomProgress = roomIndex === 0 ? room1In : room2In;
          const isExpanded = roomIndex === 0;

          return (
            <motion.div
              key={room.name}
              className="bg-card border border-border rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: roomProgress, y: 0 }}
            >
              {/* Room header - matching real DemoRoomHeader */}
              <motion.div 
                className="relative bg-muted/30 border-b border-border p-2 cursor-pointer"
                animate={roomProgress > 0.8 && roomIndex === 0 ? { scale: [1, 1.01, 1] } : {}}
              >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: isExpanded ? 0 : -90 }}
                    >
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold">{room.name}</span>
                        <Edit2 className="w-2.5 h-2.5 text-muted-foreground" />
                      </div>
                      <span className="text-[11px] font-bold text-primary">{room.total}</span>
                    </div>
                  </div>
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.div>

              {/* Windows/treatments */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    className="p-2 space-y-1.5"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                  >
                    {room.windows.map((window, winIndex) => {
                      const winDelay = winIndex * 0.1;
                      const winProgress = phaseProgress(windowsIn, winDelay, winDelay + 0.3);

                      return (
                        <motion.div
                          key={window.name}
                          className="border border-border rounded-lg overflow-hidden"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: winProgress, x: 0 }}
                        >
                          {/* Window header */}
                          <div className="flex items-center justify-between p-1.5 bg-muted/20 border-b border-border">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-medium">{window.name}</span>
                              <Edit2 className="w-2.5 h-2.5 text-muted-foreground" />
                            </div>
                            <div className="flex items-center gap-1">
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                              <Trash2 className="w-3 h-3 text-destructive/70" />
                            </div>
                          </div>

                          {/* Treatment details with fabric */}
                          <div className="p-2 flex gap-2">
                            {/* Fabric swatch */}
                            <div className={`w-12 h-14 rounded ${window.color} shrink-0 relative overflow-hidden`}>
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[9px] font-medium">{window.treatment}</span>
                                <span className="text-[7px] text-muted-foreground flex items-center gap-0.5">
                                  Details <ChevronRight className="w-2.5 h-2.5" />
                                </span>
                              </div>
                              <p className="text-[8px] text-muted-foreground mb-1">{window.fabric}</p>

                              {/* Dimensions grid */}
                              <div className="flex gap-3 text-[8px] mb-1">
                                <div>
                                  <span className="text-muted-foreground">Size</span>
                                  <p className="font-medium">{window.dims}</p>
                                </div>
                              </div>

                              {/* Price */}
                              <div className="pt-1 border-t border-border">
                                <span className="text-[9px] font-semibold text-primary">{window.price}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Add window button */}
                    <motion.button
                      className="w-full flex items-center justify-center gap-1 py-1.5 border border-dashed border-border rounded-lg text-[8px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: windowsIn > 0.8 ? 1 : 0 }}
                    >
                      <Plus className="w-3 h-3" />
                      Add Window Treatment
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Add room button */}
        <motion.button
          className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-primary/30 rounded-lg text-[9px] font-medium text-primary hover:bg-primary/5 transition-colors"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: addRoomIn, y: 0 }}
          whileHover={{ scale: 1.01 }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Room
        </motion.button>
      </div>

      {/* Footer - Quote total */}
      <motion.div 
        className="p-2 border-t border-border bg-card/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: totalIn, y: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] text-muted-foreground">Quote Total (excl. tax)</span>
          <motion.span 
            className="text-lg font-bold text-primary"
            animate={totalIn > 0.7 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            ${quoteTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </motion.span>
        </div>
        <motion.button
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium"
          whileHover={{ scale: 1.01 }}
        >
          <Check className="w-3 h-3" />
          Generate Quote PDF
        </motion.button>
      </motion.div>
    </div>
  );
};
