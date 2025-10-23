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
      className={`p-4 rounded-full transition-all duration-300 border-2 ${
        isLightOn 
          ? 'bg-amber-400 border-amber-500 text-white shadow-xl shadow-amber-500/50' 
          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
      }`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      aria-label="Toggle theme"
    >
      <Lightbulb className={`w-8 h-8 ${isLightOn ? 'fill-white' : ''}`} />
    </motion.button>
  );
};
