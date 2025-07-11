
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
      <img 
        src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
        alt="InterioApp Logo" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      {showTagline && (
        <>
          <div className="mx-3 h-6 w-px bg-brand-neutral/30" />
          <div className="hidden md:block">
            <p className={`text-brand-neutral/70 ${sloganSizeClasses[size]} lg:${sloganSizeClasses[size]} md:text-xs font-medium leading-tight`}>
              The future of window décor is online and bespoke
            </p>
          </div>
        </>
      )}
    </div>
  );
};
