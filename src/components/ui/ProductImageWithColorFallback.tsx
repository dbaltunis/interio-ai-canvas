import React, { useState, useMemo } from 'react';
import { colorNameToHex, getContrastingTextColor, generateColorGradient } from '@/utils/colorNameToHex';
import { cn } from '@/lib/utils';
import { Scissors, Package, Settings, Wrench } from 'lucide-react';

interface ProductImageWithColorFallbackProps {
  imageUrl?: string | null;
  color?: string | null;
  productName?: string;
  supplierName?: string;
  size?: number;
  className?: string;
  showColorName?: boolean;
  category?: 'fabric' | 'material' | 'hardware' | 'service' | string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  fillContainer?: boolean;
}

/**
 * Generate a consistent, muted color based on supplier name
 * Each supplier gets a unique but consistent subtle color
 */
const generateSupplierColor = (supplierName: string): { background: string; textColor: string } => {
  if (!supplierName) {
    return {
      background: 'hsl(var(--muted))',
      textColor: 'hsl(var(--muted-foreground))'
    };
  }

  // Generate a hash from the supplier name
  let hash = 0;
  for (let i = 0; i < supplierName.length; i++) {
    const char = supplierName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Use hash to generate a muted, professional hue
  const hue = Math.abs(hash) % 360;
  // Keep saturation low for professional look
  const saturation = 20 + (Math.abs(hash >> 8) % 15); // 20-35%
  const lightness = 88 + (Math.abs(hash >> 16) % 8); // 88-96% (very light)
  
  return {
    background: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    textColor: `hsl(${hue}, ${saturation + 20}%, 35%)`
  };
};

/**
 * Get the appropriate icon component based on category
 */
const getCategoryIcon = (category: string, size: number) => {
  const iconSize = size >= 64 ? 24 : size >= 40 ? 18 : 14;
  const iconProps = { size: iconSize, strokeWidth: 1.5 };
  
  switch (category) {
    case 'fabric':
      return <Scissors {...iconProps} />;
    case 'material':
      return <Package {...iconProps} />;
    case 'hardware':
      return <Settings {...iconProps} />;
    case 'service':
      return <Wrench {...iconProps} />;
    default:
      return <Scissors {...iconProps} />;
  }
};

/**
 * Get abbreviated supplier name for display
 */
const getSupplierAbbreviation = (supplierName: string, maxLength: number = 8): string => {
  if (!supplierName) return '';
  const name = supplierName.trim().toUpperCase();
  return name.length > maxLength ? name.substring(0, maxLength) : name;
};

/**
 * Universal product image component with intelligent fallback:
 * 1. Try to load image from imageUrl
 * 2. If no image or load fails → display color swatch from color field
 * 3. If no color → show category icon with supplier name on muted background
 */
export const ProductImageWithColorFallback: React.FC<ProductImageWithColorFallbackProps> = ({
  imageUrl,
  color,
  productName = 'Product',
  supplierName = '',
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

  // Generate consistent color based on supplier name
  const supplierColor = useMemo(() => generateSupplierColor(supplierName), [supplierName]);
  const supplierAbbrev = useMemo(() => getSupplierAbbreviation(supplierName, size >= 64 ? 10 : 6), [supplierName, size]);

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

  // Fallback: Category icon with supplier name on supplier-colored background
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border border-border/50 select-none gap-0.5 p-1',
        roundedClasses[rounded],
        className
      )}
      style={{
        ...containerStyle,
        background: supplierColor.background,
      }}
      title={supplierName ? `${productName} - ${supplierName}` : productName}
    >
      {/* Category icon */}
      <div style={{ color: supplierColor.textColor }} className="opacity-70">
        {getCategoryIcon(category, size)}
      </div>
      
      {/* Supplier name abbreviation */}
      {supplierAbbrev && size >= 40 && (
        <span 
          className="text-[9px] font-medium tracking-tight leading-none truncate max-w-full px-0.5"
          style={{ color: supplierColor.textColor }}
        >
          {supplierAbbrev}
        </span>
      )}
    </div>
  );
};

export default ProductImageWithColorFallback;
