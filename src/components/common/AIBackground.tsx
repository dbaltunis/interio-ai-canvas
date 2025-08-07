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
        return 'bg-gradient-to-br from-company-primary/5 to-company-secondary/10';
      default:
        return 'ai-gradient-bg';
    }
  };

  return (
    <div className={`relative overflow-hidden ${getVariantClasses()} ${className}`}>
      {/* Floating orbs */}
      <div className="ai-orb absolute top-10 right-20 w-32 h-32 opacity-60" />
      <div className="ai-orb-secondary absolute bottom-20 left-10 w-24 h-24 opacity-40" />
      <div className="ai-orb absolute top-1/2 left-1/3 w-16 h-16 opacity-30" style={{ animationDelay: '4s' }} />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};