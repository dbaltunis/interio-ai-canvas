
import React from 'react';

interface BrandHeaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandHeader = ({ className = "", size = "md", showTagline = true }: BrandHeaderProps) => {
  const sizeClasses = {
    sm: "h-12", // adjusted for better proportions
    md: "h-16", // adjusted for better proportions  
    lg: "h-20"  // adjusted for better proportions
  };

  const logoTextSizeClasses = {
    sm: "text-lg",
    md: "text-xl", 
    lg: "text-2xl"
  };

  const sloganSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-sm border border-brand-secondary/20">
        <img 
          src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
          alt="InterioApp Logo" 
          className={`${sizeClasses[size]} w-auto object-contain`}
        />
        <div className="flex flex-col">
          <h1 className={`font-bold text-brand-primary ${logoTextSizeClasses[size]} leading-tight`}>
            InterioApp
          </h1>
          {showTagline && (
            <p className={`text-brand-neutral/70 ${sloganSizeClasses[size]} font-medium leading-tight`}>
              The future of window décor is online—and bespoke
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
