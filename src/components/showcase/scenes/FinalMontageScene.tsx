import { motion, AnimatePresence } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { 
  Sparkles, ArrowRight, Users, FileText, Package, 
  Calendar, Settings, Mail, Zap, Check, Star 
} from "lucide-react";

interface SceneProps {
  progress: number;
}

const features = [
  { icon: Users, label: "Team", color: "bg-blue-500" },
  { icon: FileText, label: "Quotes", color: "bg-emerald-500" },
  { icon: Package, label: "Library", color: "bg-amber-500" },
  { icon: Calendar, label: "Calendar", color: "bg-purple-500" },
  { icon: Settings, label: "Settings", color: "bg-zinc-500" },
  { icon: Mail, label: "Email", color: "bg-rose-500" },
  { icon: Zap, label: "Integrations", color: "bg-orange-500" },
];

export const FinalMontageScene = ({ progress }: SceneProps) => {
  const rapidCuts = phaseProgress(progress, 0, 0.5);
  const logoCenter = phaseProgress(progress, 0.4, 0.65);
  const ctaIn = phaseProgress(progress, 0.6, 0.85);
  const celebration = phaseProgress(progress, 0.8, 1);

  // Calculate which feature to show in rapid cuts
  const currentFeatureIndex = Math.min(
    Math.floor(rapidCuts * features.length * 2) % features.length,
    features.length - 1
  );

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden flex items-center justify-center">
      {/* Rapid feature cuts */}
      <AnimatePresence mode="wait">
        {rapidCuts < 0.5 && (
          <motion.div
            key={currentFeatureIndex}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.15 }}
          >
            {(() => {
              const feature = features[currentFeatureIndex];
              const Icon = feature.icon;
              return (
                <div className="text-center">
                  <motion.div
                    className={`w-16 h-16 rounded-2xl ${feature.color} mx-auto mb-3 flex items-center justify-center shadow-xl`}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <span className="text-sm font-semibold text-foreground">{feature.label}</span>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central logo */}
      <motion.div
        className="absolute flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: logoCenter,
          scale: 0.5 + logoCenter * 0.5
        }}
      >
        {/* Logo with glow */}
        <motion.div
          className="relative"
          animate={{
            y: ctaIn > 0 ? -20 : 0
          }}
        >
          <motion.div
            className="absolute inset-0 w-20 h-20 -m-4 rounded-full bg-primary/30 blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-2xl">
            <span className="text-2xl font-bold text-primary-foreground">I</span>
          </div>
        </motion.div>

        <motion.h2
          className="text-lg font-bold text-foreground mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: logoCenter > 0.5 ? 1 : 0 }}
        >
          InterioApp
        </motion.h2>
        
        <motion.p
          className="text-[10px] text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: logoCenter > 0.7 ? 1 : 0 }}
        >
          Window Treatment Platform
        </motion.p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: ctaIn,
          y: 20 - ctaIn * 20
        }}
      >
        <motion.button
          className="flex items-center gap-2 px-5 py-2.5 bg-primary rounded-full shadow-xl"
          animate={{
            scale: celebration > 0 ? [1, 1.05, 1] : 1,
            boxShadow: celebration > 0 
              ? ["0 0 0 0 rgba(var(--primary), 0)", "0 0 0 10px rgba(var(--primary), 0.2)", "0 0 0 0 rgba(var(--primary), 0)"]
              : undefined
          }}
          transition={{ duration: 0.6, repeat: celebration > 0.5 ? Infinity : 0 }}
        >
          <Sparkles className="w-4 h-4 text-primary-foreground" />
          <span className="text-sm font-semibold text-primary-foreground">Start Free Trial</span>
          <ArrowRight className="w-4 h-4 text-primary-foreground" />
        </motion.button>
      </motion.div>

      {/* Celebration confetti */}
      {celebration > 0.3 && (
        <>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${10 + (i % 5) * 20}%`,
                top: "-5%",
              }}
              initial={{ y: 0, rotate: 0, opacity: 1 }}
              animate={{
                y: 200 + Math.random() * 100,
                x: (Math.random() - 0.5) * 100,
                rotate: Math.random() * 360,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.05,
                ease: "easeOut",
              }}
            >
              {i % 3 === 0 ? (
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              ) : i % 3 === 1 ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </motion.div>
          ))}
        </>
      )}

      {/* Corner sparkles */}
      <motion.div
        className="absolute top-4 right-4"
        animate={{
          rotate: [0, 180, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="w-5 h-5 text-primary/40" />
      </motion.div>
      <motion.div
        className="absolute bottom-4 left-4"
        animate={{
          rotate: [360, 180, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Sparkles className="w-4 h-4 text-primary/30" />
      </motion.div>
    </div>
  );
};
