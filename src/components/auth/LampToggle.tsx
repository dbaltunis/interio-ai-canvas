import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface LampToggleProps {
  previewTheme: 'light' | 'dark';
  onToggle: () => void;
}

export const LampToggle = ({ previewTheme, onToggle }: LampToggleProps) => {
  const isLightOn = previewTheme === 'light';
  
  console.log('LampToggle - previewTheme:', previewTheme, 'isLightOn:', isLightOn);

  return (
    <motion.button
      onClick={onToggle}
      className={`p-4 rounded-full transition-all duration-300 border-2 shadow-lg ${
        isLightOn 
          ? 'bg-amber-400 border-amber-600 text-white shadow-amber-500/60' 
          : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 shadow-slate-900/50'
      }`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      aria-label="Toggle theme"
    >
      <Lightbulb className={`w-8 h-8 ${isLightOn ? 'fill-white' : 'fill-amber-400'}`} />
    </motion.button>
  );
};
