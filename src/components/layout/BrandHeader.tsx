
import React from 'react';

interface BrandHeaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandHeader = ({ className = "", size = "md", showTagline = true }: BrandHeaderProps) => {
  const sizeClasses = {
    sm: "h-16 sm:h-20 md:h-24", 
    md: "h-24 sm:h-28 md:h-32",  
    lg: "h-32 sm:h-36 md:h-40"  
  };

  const sloganSizeClasses = {
    sm: "text-xs sm:text-xs",
    md: "text-xs sm:text-sm",
    lg: "text-sm sm:text-base"
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
