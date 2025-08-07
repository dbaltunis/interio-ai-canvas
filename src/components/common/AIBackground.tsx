import React from 'react';

interface AIBackgroundProps {
  children?: React.ReactNode;
  variant?: 'default' | 'strong' | 'subtle';
  className?: string;
}

export const AIBackground = ({ children, variant = 'default', className = '' }: AIBackgroundProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'strong':
        return 'ai-gradient-bg';
      case 'subtle':
        return 'bg-gradient-to-br from-primary/2 to-secondary/5';
      default:
        return 'ai-gradient-bg';
    }
  };

  return (
    <div className={`relative ${getVariantClasses()} ${className}`}>
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};