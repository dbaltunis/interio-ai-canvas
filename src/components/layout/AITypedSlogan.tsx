import React, { useState, useEffect } from 'react';

interface AITypedSloganProps {
  className?: string;
  onComplete?: () => void;
}

export const AITypedSlogan = ({ className = "", onComplete }: AITypedSloganProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const fullText = "The future of window decor is online and bespoke";
  
  useEffect(() => {
    let currentIndex = 0;
    
    const typeText = () => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeText, 80 + Math.random() * 40); // Variable typing speed for natural feel
      } else {
        onComplete?.();
        // Hide after 10 seconds
        setTimeout(() => {
          setIsVisible(false);
        }, 10000);
      }
    };
    
    // Start typing after a short delay
    const timer = setTimeout(typeText, 500);
    
    return () => clearTimeout(timer);
  }, [fullText, onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <div className={`transition-opacity duration-1000 ${className}`}>
      <span className="text-xs text-muted-foreground font-medium">
        {displayText}
        <span className="animate-pulse ml-1 text-primary">|</span>
      </span>
    </div>
  );
};