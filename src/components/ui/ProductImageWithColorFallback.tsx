import React, { useState, useMemo } from 'react';
import { colorNameToHex, getContrastingTextColor, generateColorGradient } from '@/utils/colorNameToHex';
import { cn } from '@/lib/utils';

interface ProductImageWithColorFallbackProps {
  imageUrl?: string | null;
  color?: string | null;
  productName?: string;
  size?: number;
  className?: string;
  showColorName?: boolean;
  category?: 'fabric' | 'material' | 'hardware' | 'service' | string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  fillContainer?: boolean;
}

/**
 * Generate a consistent gradient based on product name
 * Each product gets a unique but consistent color scheme
 */
const generateProductGradient = (name: string): { background: string; textColor: string } => {
  // Generate a hash from the name for consistent colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use hash to generate hue (0-360)
  const hue = Math.abs(hash) % 360;
  // Use secondary hash for saturation variation
  const saturation = 45 + (Math.abs(hash >> 8) % 25); // 45-70%
  const lightness = 75 + (Math.abs(hash >> 16) % 15); // 75-90%
  
  const baseColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const darkerColor = `hsl(${hue}, ${saturation + 10}%, ${lightness - 15}%)`;
  
  return {
    background: `linear-gradient(135deg, ${baseColor} 0%, ${darkerColor} 100%)`,
    textColor: lightness > 70 ? 'hsl(var(--foreground))' : 'hsl(var(--background))'
  };
};

/**
 * Get initials from product name (1-2 characters)
 */
const getProductInitials = (name: string): string => {
  if (!name) return '?';
  
  // Split by common delimiters
  const words = name.split(/[\s\-_\/]+/).filter(w => w.length > 0);
  
  if (words.length >= 2) {
    // Take first letter of first two significant words
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  // Single word: take first 2 characters
  return name.substring(0, 2).toUpperCase();
};

/**
 * Universal product image component with intelligent fallback:
 * 1. Try to load image from imageUrl
 * 2. If no image or load fails → display color swatch from color field
 * 3. If no color → show product initials on gradient background
 */
export const ProductImageWithColorFallback: React.FC<ProductImageWithColorFallbackProps> = ({
  imageUrl,
  color,
  productName = 'Product',
  size = 48,
  className = '',
  showColorName = false,
  category = 'fabric',
  rounded = 'md',
  fillContainer = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!imageUrl);

  const hexColor = colorNameToHex(color);
  const hasValidColor = !!hexColor;
  const hasValidImage = !!imageUrl && !imageError;
  const textColor = getContrastingTextColor(hexColor);

  // Generate consistent gradient for this product
  const productGradient = useMemo(() => generateProductGradient(productName), [productName]);
  const initials = useMemo(() => getProductInitials(productName), [productName]);

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // When fillContainer is true, use 100% width/height
  const containerStyle: React.CSSProperties = fillContainer
    ? { width: '100%', height: '100%' }
    : { width: size, height: size, minWidth: size, minHeight: size };

  // Calculate font size based on container size
  const fontSize = fillContainer ? 'text-lg' : size >= 64 ? 'text-base' : size >= 40 ? 'text-sm' : 'text-xs';

  // Render image if available and not errored
  if (hasValidImage) {
    return (
      <div
        className={cn(
          'relative overflow-hidden border border-border bg-muted',
          roundedClasses[rounded],
          className
        )}
        style={containerStyle}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
            <span className="text-xs text-muted-foreground">...</span>
          </div>
        )}
        <img
          src={imageUrl}
          alt={productName}
          loading="lazy"
          className="w-full h-full object-cover"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageError(true);
            setIsLoading(false);
          }}
        />
        {/* Color indicator dot if we have both image and color */}
        {hasValidColor && !isLoading && (
          <div
            className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: hexColor }}
            title={color || undefined}
          />
        )}
      </div>
    );
  }

  // Render color swatch if we have a valid color
  if (hasValidColor) {
    return (
      <div
        className={cn(
          'relative overflow-hidden border border-border flex items-center justify-center',
          roundedClasses[rounded],
          className
        )}
        style={{
          ...containerStyle,
          background: generateColorGradient(hexColor),
        }}
        title={color || undefined}
      >
        {/* Subtle texture overlay for visual interest */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
          }}
        />
        
        {/* Color name label for larger sizes */}
        {showColorName && size >= 64 && color && (
          <span
            className="relative z-10 text-xs font-medium px-1 text-center truncate max-w-full"
            style={{ color: textColor }}
          >
            {color}
          </span>
        )}
      </div>
    );
  }

  // Fallback: Product initials on gradient background
  return (
    <div
      className={cn(
        'flex items-center justify-center border border-border/50 select-none',
        roundedClasses[rounded],
        className
      )}
      style={{
        ...containerStyle,
        background: productGradient.background,
      }}
      title={productName}
    >
      <span 
        className={cn('font-semibold tracking-tight', fontSize)}
        style={{ color: productGradient.textColor }}
      >
        {initials}
      </span>
    </div>
  );
};

export default ProductImageWithColorFallback;
