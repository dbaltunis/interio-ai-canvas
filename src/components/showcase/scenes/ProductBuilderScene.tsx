import { motion, AnimatePresence } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";

interface SceneProps {
  progress: number;
}

const treatmentTypes = [
  { name: "Curtains", emoji: "🪟", color: "from-rose-400 to-rose-500" },
  { name: "Blinds", emoji: "📐", color: "from-blue-400 to-blue-500" },
  { name: "Shutters", emoji: "🚪", color: "from-amber-400 to-amber-500" },
  { name: "Romans", emoji: "🎭", color: "from-purple-400 to-purple-500" },
];

const options = [
  { label: "Fabric", value: "Velvet Silver" },
  { label: "Width", value: "180 cm" },
  { label: "Drop", value: "240 cm" },
  { label: "Lining", value: "Blockout" },
];

export const ProductBuilderScene = ({ progress }: SceneProps) => {
  const gridIn = phaseProgress(progress, 0, 0.3);
  const selectCard = phaseProgress(progress, 0.25, 0.45);
  const optionsIn = phaseProgress(progress, 0.4, 0.8);
  const morphEffect = phaseProgress(progress, 0.6, 1);
  
  const selectedIndex = Math.floor(selectCard * 4) % 4;

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background to-muted/20 overflow-hidden p-3">
      {/* Header */}
      <motion.div
        className="text-center mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: gridIn }}
      >
        <h2 className="text-sm font-semibold text-foreground">Product Builder</h2>
        <p className="text-[10px] text-muted-foreground">Every treatment type supported</p>
      </motion.div>

      {/* Treatment type grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {treatmentTypes.map((type, index) => {
          const delay = index * 0.08;
          const itemProgress = phaseProgress(gridIn, delay, delay + 0.4);
          const isSelected = index === selectedIndex && selectCard > 0.5;
          
          return (
            <motion.div
              key={type.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: itemProgress,
                y: 15 - itemProgress * 15,
                scale: isSelected ? 1.05 : 1,
              }}
              className={`relative rounded-xl p-2 text-center transition-all ${
                isSelected 
                  ? 'bg-primary/10 ring-2 ring-primary shadow-lg' 
                  : 'bg-card border border-border/50'
              }`}
            >
              <motion.div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${type.color} mx-auto mb-1 flex items-center justify-center text-lg`}
                animate={isSelected ? { 
                  rotateY: [0, 180, 360],
                } : {}}
                transition={{ duration: 0.6 }}
              >
                {type.emoji}
              </motion.div>
              <span className="text-[9px] font-medium text-foreground">{type.name}</span>
              
              {isSelected && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <span className="text-[8px] text-primary-foreground">✓</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Options panel */}
      <AnimatePresence>
        {optionsIn > 0 && (
          <motion.div
            className="bg-card rounded-xl border border-border/50 p-3 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: optionsIn, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center text-sm">
                🪟
              </div>
              <span className="text-[10px] font-medium text-foreground">Curtains Configuration</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {options.map((opt, index) => {
                const delay = index * 0.1;
                const optProgress = phaseProgress(optionsIn, delay + 0.2, delay + 0.6);
                
                return (
                  <motion.div
                    key={opt.label}
                    className="bg-muted/50 rounded-lg p-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: optProgress, x: 0 }}
                  >
                    <span className="text-[8px] text-muted-foreground block">{opt.label}</span>
                    <motion.span 
                      className="text-[10px] font-medium text-foreground"
                      animate={{
                        color: morphEffect > 0.5 ? "hsl(var(--primary))" : "hsl(var(--foreground))"
                      }}
                    >
                      {opt.value}
                    </motion.span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Morphing fabric preview */}
      <motion.div
        className="absolute bottom-3 right-3 w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-border/50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: morphEffect,
          scale: 0.8 + morphEffect * 0.2
        }}
      >
        <motion.div
          className="w-full h-full"
          animate={{
            background: [
              "linear-gradient(135deg, #c4b5a0 0%, #a89886 100%)",
              "linear-gradient(135deg, #8b9dc3 0%, #6b7daa 100%)",
              "linear-gradient(135deg, #b8a9c9 0%, #9a8ab8 100%)",
              "linear-gradient(135deg, #c4b5a0 0%, #a89886 100%)",
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] font-medium text-white/80 bg-black/30 px-1.5 py-0.5 rounded">
            Preview
          </span>
        </div>
      </motion.div>
    </div>
  );
};
