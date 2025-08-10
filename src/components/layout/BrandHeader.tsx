
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
    <div className={`relative flex items-center ${className}`}>
      <div className="relative inline-flex items-center">
        <img 
          src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
          alt="InterioApp Logo" 
          className={`logo-white ${sizeClasses[size]} w-auto object-contain transition-all brightness-110 drop-shadow-md md:drop-shadow-lg`}
        />
        <Sparkles 
          className="pointer-events-none absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 text-primary/80 dark:text-primary/90 drop-shadow-md opacity-0 animate-sparkle-minute" 
          aria-hidden="true" 
          style={{ animationDelay: '10s' }}
        />
      </div>
      {showTagline && (
        <>
          <div className="mx-2 sm:mx-3 h-4 sm:h-5 md:h-6 w-px bg-brand-secondary/40 hidden lg:block" />
          <div className="hidden lg:block">
            <div className="flex flex-col">
              <p className={`text-foreground ${sloganSizeClasses[size]} leading-tight`}>
                The future of window décor
              </p>
              <p className={`text-foreground ${sloganSizeClasses[size]} leading-tight`}>
                is online and bespoke
              </p>
            </div>
          </div>
        </>
      )}
      {/* AI-like sweep across logo and slogan after 10s */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <div className="absolute -inset-y-4 -left-1/3 h-[200%] w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-primary/40 blur-[2px] animate-[logo-sweep_3s_ease-in-out_10s_1_both]" />
        <Sparkles
          className="absolute top-0 left-0 h-4 w-4 text-primary/90 opacity-0 animate-[stars-travel_3s_ease-in-out_10s_1_both]"
          aria-hidden="true"
        />
        <Sparkles
          className="absolute bottom-0 left-1/4 h-3 w-3 text-primary/70 opacity-0 animate-[stars-travel_3s_ease-in-out_10s_1_both]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
