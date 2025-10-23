import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface AnimatedGradientProps {
  previewTheme: 'light' | 'dark';
}

export const AnimatedGradient = ({ previewTheme }: AnimatedGradientProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20" />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {previewTheme === 'dark' ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A2F35] via-[#1A4A52] to-[#2A5A62] animate-gradient-shift" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8F4F1] via-[#F5F9F7] to-[#FFFFFF] animate-gradient-shift" />
      )}
      
      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float-gentle" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/30 rounded-full blur-3xl animate-float-gentle animation-delay-2000" />
      <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-float-gentle animation-delay-4000" />
    </div>
  );
};
