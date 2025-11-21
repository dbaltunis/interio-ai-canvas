
import React from 'react';


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

  const textSizeClasses = {
    sm: "text-lg sm:text-xl", 
    md: "text-xl sm:text-2xl",  
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl"  
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="relative inline-flex items-center">
        <h1 className={`${textSizeClasses[size]} font-bold text-foreground tracking-tight`}>
          InterioApp
        </h1>
        {showTagline && (
          <span className={`${sloganSizeClasses[size]} text-muted-foreground ml-2 hidden sm:inline`}>
            Window Treatment Solutions
          </span>
        )}
      </div>
    </div>
  );
};
