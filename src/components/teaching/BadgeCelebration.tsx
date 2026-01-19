import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AchievementBadge } from '@/config/achievementBadges';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface BadgeCelebrationProps {
  badge: AchievementBadge | null;
  open: boolean;
  onClose: () => void;
}

export const BadgeCelebration = ({ badge, open, onClose }: BadgeCelebrationProps) => {
  if (!badge) return null;
  
  const Icon = badge.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent 
        className="sm:max-w-[320px] p-0 gap-0 overflow-hidden border-0"
        onPointerDownOutside={onClose}
      >
        <DialogTitle className="sr-only">Badge Unlocked</DialogTitle>
        
        {/* Animated Background */}
        <div className={cn(
          "relative py-10 px-6 text-center overflow-hidden",
          "bg-gradient-to-br", badge.gradient
        )}>
          {/* Confetti particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  y: -20,
                  x: Math.random() * 300 - 150,
                }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  y: [0, 200],
                  x: (Math.random() * 100 - 50) + (Math.random() * 300 - 150),
                  rotate: Math.random() * 720,
                }}
                transition={{ 
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
                className={cn(
                  "absolute top-0 w-2 h-2 rounded-sm",
                  i % 4 === 0 ? "bg-white/80" :
                  i % 4 === 1 ? "bg-yellow-300/80" :
                  i % 4 === 2 ? "bg-pink-300/80" :
                  "bg-cyan-300/80"
                )}
              />
            ))}
          </div>

          {/* Badge Icon with Glow */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2,
            }}
            className="relative mx-auto mb-4"
          >
            {/* Glow rings */}
            <motion.div
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ 
                duration: 2, 
                repeat: 3,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full bg-white/30 blur-xl"
              style={{ width: 96, height: 96, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            />
            
            <div className="h-20 w-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border-2 border-white/30">
              <Icon className="h-10 w-10 text-white drop-shadow-lg" />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-1 mb-2">
              <Sparkles className="h-4 w-4 text-white/80" />
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
                Badge Unlocked
              </span>
              <Sparkles className="h-4 w-4 text-white/80" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2 drop-shadow-md">
              {badge.name}
            </h2>
            
            <p className="text-sm text-white/80">
              {badge.description}
            </p>
          </motion.div>
        </div>

        {/* Button */}
        <div className="p-4 bg-card">
          <Button 
            onClick={onClose} 
            className="w-full"
            size="sm"
          >
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
