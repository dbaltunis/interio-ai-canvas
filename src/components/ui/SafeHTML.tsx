import React from 'react';
import { sanitizeHTML, SafeHTMLProps } from '@/utils/htmlSanitizer';

// React component for safe HTML rendering
export const SafeHTML: React.FC<SafeHTMLProps> = ({ html, className }) => {
  const sanitizedHTML = sanitizeHTML(html);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};