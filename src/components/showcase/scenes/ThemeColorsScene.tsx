import { motion } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { Sun, Moon, Palette } from "lucide-react";

interface SceneProps {
  progress: number;
}

const colorPalettes = [
  { name: "Ocean", colors: ["#0ea5e9", "#06b6d4", "#14b8a6"] },
  { name: "Forest", colors: ["#22c55e", "#16a34a", "#15803d"] },
  { name: "Sunset", colors: ["#f97316", "#ea580c", "#dc2626"] },
  { name: "Violet", colors: ["#8b5cf6", "#7c3aed", "#6d28d9"] },
];

export const ThemeColorsScene = ({ progress }: SceneProps) => {
  const splitReveal = phaseProgress(progress, 0, 0.4);
  const colorsIn = phaseProgress(progress, 0.3, 0.7);
  const pulseColors = phaseProgress(progress, 0.6, 1);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Split screen effect */}
      <div className="absolute inset-0 flex">
        {/* Light mode side */}
        <motion.div
          className="relative bg-white"
          initial={{ width: "100%" }}
          animate={{ width: `${100 - splitReveal * 50}%` }}
        >
          <div className="absolute inset-0 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-medium text-zinc-900">Light Mode</span>
            </div>
            
            {/* Mock UI elements */}
            <div className="space-y-2">
              <div className="h-6 bg-zinc-100 rounded-lg" />
              <div className="flex gap-2">
                <div className="h-10 flex-1 bg-zinc-100 rounded-lg" />
                <div className="h-10 w-10 bg-blue-500 rounded-lg" />
              </div>
              <div className="h-4 bg-zinc-100 rounded w-3/4" />
              <div className="h-4 bg-zinc-100 rounded w-1/2" />
            </div>
          </div>
        </motion.div>

        {/* Dark mode side */}
        <motion.div
          className="relative bg-zinc-900"
          initial={{ width: "0%" }}
          animate={{ width: `${splitReveal * 50}%` }}
        >
          <div className="absolute inset-0 p-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-medium text-zinc-100">Dark Mode</span>
            </div>
            
            {/* Mock UI elements */}
            <div className="space-y-2">
              <div className="h-6 bg-zinc-800 rounded-lg" />
              <div className="flex gap-2">
                <div className="h-10 flex-1 bg-zinc-800 rounded-lg" />
                <div className="h-10 w-10 bg-blue-500 rounded-lg" />
              </div>
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
              <div className="h-4 bg-zinc-800 rounded w-1/2" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Divider line */}
      <motion.div
        className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary to-primary/50"
        style={{ left: `${100 - splitReveal * 50}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: splitReveal }}
      />

      {/* Color palettes */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border border-border/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: colorsIn,
          y: 20 - colorsIn * 20
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Brand Colors</span>
        </div>
        
        <div className="flex gap-2">
          {colorPalettes.map((palette, index) => {
            const delay = index * 0.1;
            const paletteProgress = phaseProgress(colorsIn, delay + 0.2, delay + 0.5);
            const isPulsing = pulseColors > 0.5 && index === Math.floor(pulseColors * 4) % 4;
            
            return (
              <motion.div
                key={palette.name}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: paletteProgress,
                  scale: isPulsing ? 1.1 : 0.8 + paletteProgress * 0.2
                }}
              >
                <div className="flex gap-0.5 mb-1">
                  {palette.colors.map((color, i) => (
                    <motion.div
                      key={i}
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: color }}
                      animate={isPulsing ? {
                        scale: [1, 1.2, 1],
                        boxShadow: [`0 0 0 0 ${color}40`, `0 0 0 4px ${color}00`]
                      } : {}}
                      transition={{ duration: 0.6 }}
                    />
                  ))}
                </div>
                <span className="text-[8px] text-muted-foreground">{palette.name}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
