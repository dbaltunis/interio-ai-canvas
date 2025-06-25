
import React from 'react';

interface BrandHeaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandHeader = ({ className = "", size = "md", showTagline = false }: BrandHeaderProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12", 
    lg: "h-16"
  };

  const textSizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src="/lovable-uploads/8a183542-3c01-459f-ae93-d9f91bb41f35.png" 
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
