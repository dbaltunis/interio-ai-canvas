import React from 'react';
import { ProductImageWithColorFallback } from '@/components/ui/ProductImageWithColorFallback';

interface QuoteItemImageProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  fabricImageUrl?: string;
  treatmentImageUrl?: string;
  imagePreference?: 'fabric' | 'treatment';
  color?: string; // Color for fallback display
  category?: string; // Category for icon fallback
}

export const QuoteItemImage: React.FC<QuoteItemImageProps> = ({ 
  src, 
  alt = 'Product image',
  size = 40,
  className = '',
  fabricImageUrl,
  treatmentImageUrl,
  imagePreference = 'fabric',
  color,
  category = 'fabric'
}) => {
  // Determine which image to display based on preference
  const displayImage = imagePreference === 'treatment' && treatmentImageUrl 
    ? treatmentImageUrl 
    : (fabricImageUrl || src);

  return (
    <ProductImageWithColorFallback
      imageUrl={displayImage}
      color={color}
      productName={alt}
      category={category}
      size={size}
      className={className}
      rounded="md"
    />
  );
};
