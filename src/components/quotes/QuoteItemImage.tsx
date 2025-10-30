import React from 'react';

interface QuoteItemImageProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  fabricImageUrl?: string;
  treatmentImageUrl?: string;
  imagePreference?: 'fabric' | 'treatment';
}

export const QuoteItemImage: React.FC<QuoteItemImageProps> = ({ 
  src, 
  alt = 'Product image',
  size = 40,
  className = '',
  fabricImageUrl,
  treatmentImageUrl,
  imagePreference = 'fabric'
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Determine which image to display based on preference
  const displayImage = imagePreference === 'treatment' && treatmentImageUrl 
    ? treatmentImageUrl 
    : (fabricImageUrl || src);

  if (!displayImage || imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded border border-border ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      >
        <span className="text-xs text-muted-foreground">📦</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded border border-border ${className}`} style={{ width: size, height: size, minWidth: size, minHeight: size }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-xs text-muted-foreground">...</span>
        </div>
      )}
      <img
        src={displayImage}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};
