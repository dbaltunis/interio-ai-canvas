import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface LampToggleProps {
  previewTheme: 'light' | 'dark';
  onToggle: () => void;
}

export const LampToggle = ({ previewTheme, onToggle }: LampToggleProps) => {
  const isLightOn = previewTheme === 'light';

  return (
    <motion.button
      onClick={onToggle}
      className={`p-3 rounded-full transition-all duration-300 ${
        isLightOn 
          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50' 
          : 'bg-white/10 text-white/70 hover:bg-white/20'
      }`}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <Lightbulb className="w-6 h-6" />
    </motion.button>
  );
};
