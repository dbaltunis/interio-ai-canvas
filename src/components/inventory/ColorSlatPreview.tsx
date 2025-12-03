import { cn } from "@/lib/utils";

interface ColorSlatPreviewProps {
  hexColor: string;
  slatWidth?: number; // in mm (e.g., 25, 50, 63 for venetian; 89, 127 for vertical)
  materialType?: string; // "aluminum", "wood", "faux_wood", "pvc", "fabric"
  orientation?: 'horizontal' | 'vertical'; // horizontal for venetian, vertical for vertical blinds
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ColorSlatPreview = ({ 
  hexColor, 
  slatWidth = 50, 
  materialType,
  orientation = 'horizontal',
  className,
  showLabel = false,
  size = 'md'
}: ColorSlatPreviewProps) => {
  
  // Calculate dimensions based on orientation and slat width
  const getHorizontalSlatHeight = () => {
    const baseHeight = size === 'sm' ? 8 : size === 'md' ? 12 : 16;
    if (slatWidth <= 25) return baseHeight * 0.6;
    if (slatWidth <= 35) return baseHeight * 0.8;
    if (slatWidth <= 50) return baseHeight;
    return baseHeight * 1.3; // 63mm+ slats
  };

  const getVerticalVaneWidth = () => {
    const baseWidth = size === 'sm' ? 12 : size === 'md' ? 18 : 24;
    // 89mm vanes are narrower, 127mm are wider
    if (slatWidth <= 89) return baseWidth * 0.7;
    return baseWidth; // 127mm vanes
  };

  const containerHeight = size === 'sm' ? 'h-16' : size === 'md' ? 'h-24' : 'h-32';
  const containerWidth = size === 'sm' ? 'w-16' : size === 'md' ? 'w-full max-w-[200px]' : 'w-full max-w-[300px]';

  // Determine if material is wood-like for grain texture
  const isWoodLike = materialType === 'wood' || materialType === 'faux_wood';
  const isMetallic = materialType === 'aluminum';
  const isFabric = materialType === 'fabric';

  // Create gradient for 3D effect
  const getGradient = () => {
    // Parse hex to RGB for gradient manipulation
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Lighter and darker versions for 3D effect
    const lighten = (value: number, amount: number) => Math.min(255, Math.round(value + amount));
    const darken = (value: number, amount: number) => Math.max(0, Math.round(value - amount));
    
    const lightR = lighten(r, 40);
    const lightG = lighten(g, 40);
    const lightB = lighten(b, 40);
    
    const darkR = darken(r, 30);
    const darkG = darken(g, 30);
    const darkB = darken(b, 30);

    if (isMetallic) {
      // Metallic sheen gradient
      return `linear-gradient(180deg, 
        rgb(${lightR}, ${lightG}, ${lightB}) 0%, 
        rgb(${r}, ${g}, ${b}) 30%,
        rgb(${lightR}, ${lightG}, ${lightB}) 50%,
        rgb(${r}, ${g}, ${b}) 70%,
        rgb(${darkR}, ${darkG}, ${darkB}) 100%
      )`;
    }

    if (isFabric && orientation === 'vertical') {
      // Softer gradient for fabric vanes
      return `linear-gradient(90deg, 
        rgb(${darkR}, ${darkG}, ${darkB}) 0%, 
        rgb(${r}, ${g}, ${b}) 15%,
        rgb(${r}, ${g}, ${b}) 85%,
        rgb(${darkR}, ${darkG}, ${darkB}) 100%
      )`;
    }
    
    // Standard 3D rounded effect
    return `linear-gradient(180deg, 
      rgb(${lightR}, ${lightG}, ${lightB}) 0%, 
      rgb(${r}, ${g}, ${b}) 40%,
      rgb(${r}, ${g}, ${b}) 60%,
      rgb(${darkR}, ${darkG}, ${darkB}) 100%
    )`;
  };

  // Wood grain pattern overlay
  const getWoodGrainStyle = (): React.CSSProperties => {
    if (!isWoodLike) return {};
    return {
      backgroundImage: `
        ${getGradient()},
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, 0.03) 2px,
          rgba(0, 0, 0, 0.03) 4px
        )
      `,
      backgroundBlendMode: 'normal, overlay'
    };
  };

  // Fabric texture overlay for vertical blinds
  const getFabricTextureStyle = (): React.CSSProperties => {
    if (!isFabric) return {};
    return {
      backgroundImage: `
        ${getGradient()},
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 1px,
          rgba(0, 0, 0, 0.02) 1px,
          rgba(0, 0, 0, 0.02) 2px
        )
      `,
      backgroundBlendMode: 'normal, overlay'
    };
  };

  const getMaterialLabel = () => {
    if (!materialType) return '';
    const labels: Record<string, string> = {
      'aluminum': 'Aluminum',
      'wood': 'Wood',
      'faux_wood': 'Faux Wood',
      'pvc': 'PVC',
      'fabric': 'Fabric',
      'cellular': 'Cellular'
    };
    return labels[materialType] || materialType;
  };

  const getLabel = () => {
    const materialLabel = getMaterialLabel();
    if (orientation === 'vertical') {
      return `${slatWidth}mm ${materialLabel} Vane`;
    }
    return `${slatWidth}mm ${materialLabel}`;
  };

  // Render horizontal slats (for venetian blinds)
  const renderHorizontalSlats = () => {
    const slatHeight = getHorizontalSlatHeight();
    return (
      <div 
        className={cn(
          "relative flex flex-col justify-center gap-1 rounded-lg p-3 bg-muted/30 border",
          containerHeight,
          containerWidth
        )}
      >
        {/* Render 3 slats to show stacking effect */}
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-full rounded-full shadow-sm"
            style={{
              height: `${slatHeight}px`,
              background: getGradient(),
              boxShadow: '0 1px 2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
              ...getWoodGrainStyle()
            }}
          />
        ))}
      </div>
    );
  };

  // Render vertical vanes (for vertical blinds)
  const renderVerticalVanes = () => {
    const vaneWidth = getVerticalVaneWidth();
    const vaneCount = size === 'sm' ? 4 : size === 'md' ? 5 : 6;
    
    return (
      <div 
        className={cn(
          "relative flex flex-row justify-center items-stretch gap-1 rounded-lg p-3 bg-muted/30 border",
          containerHeight,
          containerWidth
        )}
      >
        {/* Render vertical vanes side by side */}
        {Array.from({ length: vaneCount }).map((_, index) => (
          <div
            key={index}
            className="h-full rounded-sm shadow-sm"
            style={{
              width: `${vaneWidth}px`,
              background: getGradient(),
              boxShadow: '1px 0 2px rgba(0,0,0,0.1), inset 1px 0 0 rgba(255,255,255,0.15)',
              ...getFabricTextureStyle()
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Slat/Vane Preview */}
      {orientation === 'vertical' ? renderVerticalVanes() : renderHorizontalSlats()}
      
      {/* Label */}
      {showLabel && (
        <p className="text-xs text-muted-foreground text-center">
          {getLabel()}
        </p>
      )}
    </div>
  );
};

// Helper to get hex color from color value
export const getColorHex = (
  colorValue: string,
  colorPalette: Array<{ value: string; hex: string }>,
  customColors?: Array<{ value: string; hex: string }>
): string => {
  // Check custom colors first
  if (customColors) {
    const customColor = customColors.find(c => c.value === colorValue);
    if (customColor) return customColor.hex;
  }
  
  // Check standard palette
  const paletteColor = colorPalette.find(c => c.value === colorValue);
  if (paletteColor) return paletteColor.hex;
  
  // If the value itself looks like a hex color, return it
  if (colorValue.startsWith('#')) return colorValue;
  
  return '#808080'; // fallback grey
};
