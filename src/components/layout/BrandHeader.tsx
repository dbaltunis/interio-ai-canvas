
import React from 'react';
import { Sparkles } from 'lucide-react';

interface BrandHeaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const BrandHeader = ({ className = "", size = "md", showTagline = true }: BrandHeaderProps) => {
  const sizeClasses = {
    sm: "h-8 sm:h-10 md:h-12", 
    md: "h-12 sm:h-14 md:h-16",  
    lg: "h-16 sm:h-18 md:h-20",
    xl: "h-20 sm:h-22 md:h-24"  
  };

  const sloganSizeClasses = {
    sm: "text-[8px] sm:text-[10px]", // Made smaller
    md: "text-[10px] sm:text-xs", // Made smaller  
    lg: "text-xs sm:text-sm", // Made smaller
    xl: "text-[10px] sm:text-xs" // Made even smaller for xl
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative inline-flex items-center">
        <img 
          src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
          alt="InterioApp Logo" 
          className={`logo-white ${sizeClasses[size]} w-auto object-contain transition-all brightness-110 drop-shadow-md md:drop-shadow-lg`}
        />
        <Sparkles 
          className="pointer-events-none absolute -top-1 -right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary/60 dark:text-primary/70 drop-shadow-sm opacity-0 animate-sparkle-minute" 
          aria-hidden="true" 
        />
      </div>
      {showTagline && (
        <>
          <div className="mx-2 sm:mx-3 h-4 sm:h-5 md:h-6 w-px bg-brand-secondary/40 hidden lg:block" />
          <div className="hidden lg:block">
            <div className="flex flex-col">
              <p className={`text-foreground ${sloganSizeClasses[size]} font-semibold leading-tight`}>
                The future of window décor
              </p>
              <p className={`text-foreground ${sloganSizeClasses[size]} font-semibold leading-tight`}>
                is online and bespoke
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
