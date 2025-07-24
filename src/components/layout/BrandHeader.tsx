
import React from 'react';

interface BrandHeaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandHeader = ({ className = "", size = "md", showTagline = true }: BrandHeaderProps) => {
  const sizeClasses = {
    sm: "h-8 sm:h-10 md:h-12", 
    md: "h-12 sm:h-14 md:h-16",  
    lg: "h-16 sm:h-18 md:h-20"  
  };

  const sloganSizeClasses = {
    sm: "text-xs sm:text-sm",
    md: "text-sm sm:text-base",
    lg: "text-base sm:text-lg"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
        alt="InterioApp Logo" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      {showTagline && (
        <>
          <div className="mx-2 sm:mx-3 h-4 sm:h-5 md:h-6 w-px bg-brand-secondary/40 hidden sm:block" />
          <div className="hidden sm:block">
            <div className="flex flex-col">
              <p className={`text-brand-neutral/80 ${sloganSizeClasses[size]} font-medium leading-tight`}>
                The future of window décor
              </p>
              <p className={`text-brand-neutral/80 ${sloganSizeClasses[size]} font-medium leading-tight`}>
                is online and bespoke
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
