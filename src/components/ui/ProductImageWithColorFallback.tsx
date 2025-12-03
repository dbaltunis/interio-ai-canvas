import React, { useState } from 'react';
import { Package, Palette, Layers } from 'lucide-react';
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
}

/**
 * Universal product image component with intelligent fallback:
 * 1. Try to load image from imageUrl
 * 2. If no image or load fails → display color swatch from color field
 * 3. If no color → show category-appropriate icon with styled background
 * 
 * This component is used across ALL SaaS users for consistent display.
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
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!imageUrl);

  // Convert color name to hex
  const hexColor = colorNameToHex(color);
  const hasValidColor = !!hexColor;
  const hasValidImage = !!imageUrl && !imageError;

  // Get contrasting text color for overlays
  const textColor = getContrastingTextColor(hexColor);

  // Get category icon
  const getCategoryIcon = () => {
    const iconSize = Math.max(16, size * 0.4);
    const iconProps = { size: iconSize, className: 'text-muted-foreground' };
    
    switch (category?.toLowerCase()) {
      case 'fabric':
      case 'fabrics':
        return <Layers {...iconProps} />;
      case 'material':
      case 'materials':
      case 'slat':
      case 'slats':
      case 'vane':
      case 'vanes':
        return <Palette {...iconProps} />;
      default:
        return <Package {...iconProps} />;
    }
  };

  // Round class mapping
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
  };

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
          crossOrigin="anonymous"
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

  // Fallback: category icon with styled background
  return (
    <div
      className={cn(
        'flex items-center justify-center border border-border bg-muted',
        roundedClasses[rounded],
        className
      )}
      style={containerStyle}
    >
      {getCategoryIcon()}
    </div>
  );
};

export default ProductImageWithColorFallback;
