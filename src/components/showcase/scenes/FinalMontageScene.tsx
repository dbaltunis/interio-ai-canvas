import { motion, AnimatePresence } from "framer-motion";
import { phaseProgress } from "@/lib/demoAnimations";
import { 
  Sparkles, ArrowRight, Check, Star, Zap,
  FolderOpen, Users, Package, Calendar, Mail, Settings
} from "lucide-react";

interface SceneProps {
  progress: number;
}

// Feature icons for rapid cuts
const features = [
  { icon: FolderOpen, label: "Jobs", color: "bg-blue-500" },
  { icon: Users, label: "Clients", color: "bg-emerald-500" },
  { icon: Package, label: "Library", color: "bg-amber-500" },
  { icon: Calendar, label: "Calendar", color: "bg-purple-500" },
  { icon: Mail, label: "Messaging", color: "bg-rose-500" },
  { icon: Settings, label: "Settings", color: "bg-zinc-500" },
  { icon: Zap, label: "Integrations", color: "bg-orange-500" },
];

// Confetti particles
const confettiColors = ["bg-primary", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-purple-500"];

export const FinalMontageScene = ({ progress }: SceneProps) => {
  const rapidCuts = phaseProgress(progress, 0, 0.4);
  const logoZoom = phaseProgress(progress, 0.35, 0.6);
  const taglineIn = phaseProgress(progress, 0.55, 0.75);
  const ctaIn = phaseProgress(progress, 0.7, 0.9);
  const celebration = phaseProgress(progress, 0.85, 1);

  // Calculate which feature to show
  const featureIndex = Math.min(
    Math.floor(rapidCuts * features.length * 1.5) % features.length,
    features.length - 1
  );

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden flex flex-col items-center justify-center">
      {/* Animated background grid */}
      <motion.div 
        className="absolute inset-0 opacity-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
      >
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}
        />
      </motion.div>

      {/* Rapid feature cuts */}
      <AnimatePresence mode="wait">
        {rapidCuts < 0.45 && rapidCuts > 0 && (
          <motion.div
            key={featureIndex}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.2, rotate: 5 }}
            transition={{ duration: 0.15 }}
          >
            {(() => {
              const feature = features[featureIndex];
              const Icon = feature.icon;
              return (
                <div className="text-center">
                  <motion.div
                    className={`w-20 h-20 rounded-2xl ${feature.color} mx-auto mb-4 flex items-center justify-center shadow-2xl`}
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <motion.span 
                    className="text-lg font-bold text-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {feature.label}
                  </motion.span>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central logo and branding */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: logoZoom > 0.3 ? 1 : 0,
          scale: 0.5 + logoZoom * 0.5,
          y: taglineIn > 0 ? -10 : 0
        }}
      >
        {/* Glowing background */}
        <motion.div
          className="absolute -inset-8 rounded-full bg-primary/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Logo */}
        <motion.div
          className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-2xl mb-3"
          animate={logoZoom > 0.8 ? {
            boxShadow: ["0 0 0 0 rgba(var(--primary), 0)", "0 0 30px 10px rgba(var(--primary), 0.3)", "0 0 0 0 rgba(var(--primary), 0)"]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-3xl font-bold text-primary-foreground">I</span>
        </motion.div>

        <motion.h1
          className="text-xl font-bold text-foreground mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: logoZoom > 0.6 ? 1 : 0 }}
        >
          InterioApp
        </motion.h1>

        <motion.p
          className="text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: logoZoom > 0.8 ? 1 : 0 }}
        >
          Window Treatment Platform
        </motion.p>
      </motion.div>

      {/* Tagline */}
      <motion.div
        className="absolute bottom-20 left-0 right-0 text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: taglineIn,
          y: 20 - taglineIn * 20
        }}
      >
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Everything you need to manage quotes, clients, and projects in one place
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        className="absolute bottom-6 left-0 right-0 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: ctaIn,
          y: 20 - ctaIn * 20
        }}
      >
        <motion.button
          className="flex items-center gap-2 px-6 py-3 bg-primary rounded-full shadow-xl"
          animate={celebration > 0.3 ? {
            scale: [1, 1.05, 1],
            boxShadow: ["0 0 0 0 rgba(var(--primary), 0)", "0 0 0 12px rgba(var(--primary), 0.15)", "0 0 0 0 rgba(var(--primary), 0)"]
          } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Sparkles className="w-4 h-4 text-primary-foreground" />
          <span className="text-sm font-semibold text-primary-foreground">Start Free Trial</span>
          <ArrowRight className="w-4 h-4 text-primary-foreground" />
        </motion.button>
      </motion.div>

      {/* Celebration confetti */}
      <AnimatePresence>
        {celebration > 0.3 && (
          <>
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  left: `${5 + (i % 6) * 16}%`,
                  top: "-5%",
                }}
                initial={{ y: 0, rotate: 0, opacity: 1 }}
                animate={{
                  y: 250 + Math.random() * 80,
                  x: (Math.random() - 0.5) * 120,
                  rotate: Math.random() * 360,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.04,
                  ease: "easeOut",
                }}
              >
                {i % 4 === 0 ? (
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                ) : i % 4 === 1 ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : i % 4 === 2 ? (
                  <Sparkles className="w-3 h-3 text-primary" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${confettiColors[i % confettiColors.length]}`} />
                )}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Corner decorations */}
      <motion.div
        className="absolute top-4 right-4"
        animate={{
          rotate: [0, 180, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Sparkles className="w-5 h-5 text-primary/30" />
      </motion.div>
      <motion.div
        className="absolute bottom-24 left-4"
        animate={{
          rotate: [360, 180, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <Sparkles className="w-4 h-4 text-primary/20" />
      </motion.div>
    </div>
  );
};
