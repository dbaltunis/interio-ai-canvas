
import React from 'react';

interface BrandHeaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandHeader = ({ className = "", size = "md", showTagline = false }: BrandHeaderProps) => {
  const sizeClasses = {
    sm: "h-16", // doubled from h-8
    md: "h-24", // doubled from h-12
    lg: "h-32"  // doubled from h-16
  };

  const textSizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
        alt="InterioApp Logo" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      <div className="flex flex-col">
        <h1 className={`font-bold text-brand-primary ${textSizeClasses[size]} leading-tight`}>
          InterioApp
        </h1>
        {showTagline && (
          <p className="text-sm text-brand-neutral">
            Professional Window & Wall Covering Solutions
          </p>
        )}
      </div>
    </div>
  );
};
