
import React from 'react';

interface BrandHeaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandHeader = ({ className = "", size = "md", showTagline = true }: BrandHeaderProps) => {
  const sizeClasses = {
    sm: "h-16", // increased from h-12
    md: "h-20", // increased from h-16  
    lg: "h-24"  // increased from h-20
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
        {showTagline && (
          <div className="flex flex-col">
            <p className={`text-brand-neutral/70 ${sloganSizeClasses[size]} font-medium leading-tight`}>
              The future of window décor is online—
            </p>
            <p className={`text-brand-neutral/70 ${sloganSizeClasses[size]} font-medium leading-tight`}>
              and bespoke
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
