import React, { useState, useEffect } from 'react';

interface AITypedSloganProps {
  className?: string;
  onComplete?: () => void;
}

export const AITypedSlogan = ({ className = "", onComplete }: AITypedSloganProps) => {
  const [showFirstLine, setShowFirstLine] = useState(false);
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Magical staggered reveal
    const timer1 = setTimeout(() => setShowFirstLine(true), 300);
    const timer2 = setTimeout(() => setShowSecondLine(true), 800);
    const timer3 = setTimeout(() => onComplete?.(), 1500);
    
    // Hide after 10 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(hideTimer);
    };
  }, [onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${className}`}>
      <div className="flex flex-col space-y-1">
        <div 
          className={`
            transition-all duration-700 ease-out transform
            ${showFirstLine ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
          `}
        >
          <span className="text-xs font-medium bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-pulse">
            The future of window decor
          </span>
        </div>
        <div 
          className={`
            transition-all duration-700 ease-out transform delay-300
            ${showSecondLine ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
          `}
        >
          <span className="text-xs font-medium bg-gradient-to-r from-purple-500 via-primary to-purple-500 bg-clip-text text-transparent animate-pulse">
            is online and bespoke
          </span>
        </div>
      </div>
      
      {/* Magical shimmer overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className={`
            absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
            w-full h-full transform -skew-x-12 transition-transform duration-1000
            ${showSecondLine ? 'translate-x-full' : '-translate-x-full'}
          `}
          style={{ 
            animation: showSecondLine ? 'shimmer-pass 2s ease-out 0.5s' : 'none'
          }}
        />
      </div>
    </div>
  );
};