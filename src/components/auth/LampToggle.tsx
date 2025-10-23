import { useState } from 'react';
import { motion } from 'framer-motion';

interface LampToggleProps {
  previewTheme: 'light' | 'dark';
  onToggle: () => void;
}

export const LampToggle = ({ previewTheme, onToggle }: LampToggleProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const isLightOn = previewTheme === 'light';

  const handleClick = () => {
    setIsPulling(true);
    setTimeout(() => {
      setIsPulling(false);
      onToggle();
    }, 300);
  };

  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={handleClick}>
      {/* Lamp Fixture */}
      <div className={`w-16 h-4 rounded-t-lg transition-colors duration-300 ${
        isLightOn ? 'bg-amber-600' : 'bg-slate-600'
      }`} />
      
      {/* Pull Cord */}
      <motion.div
        className="w-0.5 bg-slate-400"
        animate={{
          height: isPulling ? '48px' : '32px',
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Cord Knob */}
      <motion.div
        className={`w-3 h-3 rounded-full transition-all duration-300 ${
          isLightOn ? 'bg-amber-500' : 'bg-slate-500'
        }`}
        animate={{
          y: isPulling ? 8 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Light Bulb */}
      <div className="relative">
        <motion.div
          className={`w-12 h-16 rounded-full transition-all duration-500 ${
            isLightOn 
              ? 'bg-gradient-to-b from-amber-300 to-amber-500 shadow-lg shadow-amber-500/50' 
              : 'bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600'
          }`}
          animate={{
            filter: isLightOn 
              ? 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.8))' 
              : 'drop-shadow(0 0 0px rgba(0, 0, 0, 0))',
          }}
        />
        
        {/* Bulb Base */}
        <div className={`w-8 h-4 mx-auto mt-1 rounded-sm transition-colors duration-300 ${
          isLightOn ? 'bg-amber-700' : 'bg-slate-700'
        }`}>
          <div className="w-full h-0.5 bg-black/20 my-0.5" />
          <div className="w-full h-0.5 bg-black/20 my-0.5" />
        </div>
      </div>
      
      {/* Label */}
      <p className={`text-xs font-medium mt-2 transition-colors duration-300 ${
        isLightOn ? 'text-white' : 'text-white/70'
      }`}>
        {isLightOn ? 'Turn off' : 'Turn on'}
      </p>
    </div>
  );
};
