import { cn } from "@/lib/utils";

interface ColorSlatPreviewProps {
  hexColor: string;
  slatWidth?: number; // in mm (e.g., 25, 50, 63)
  materialType?: string; // "aluminum", "wood", "faux_wood", "pvc"
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ColorSlatPreview = ({ 
  hexColor, 
  slatWidth = 50, 
  materialType,
  className,
  showLabel = false,
  size = 'md'
}: ColorSlatPreviewProps) => {
  // Calculate height based on slat width for realistic proportions
  const getSlatHeight = () => {
    const baseHeight = size === 'sm' ? 8 : size === 'md' ? 12 : 16;
    if (slatWidth <= 25) return baseHeight * 0.6;
    if (slatWidth <= 35) return baseHeight * 0.8;
    if (slatWidth <= 50) return baseHeight;
    return baseHeight * 1.3; // 63mm+ slats
  };

  const slatHeight = getSlatHeight();
  const containerHeight = size === 'sm' ? 'h-16' : size === 'md' ? 'h-24' : 'h-32';
  const containerWidth = size === 'sm' ? 'w-16' : size === 'md' ? 'w-full max-w-[200px]' : 'w-full max-w-[300px]';

  // Determine if material is wood-like for grain texture
  const isWoodLike = materialType === 'wood' || materialType === 'faux_wood';
  const isMetallic = materialType === 'aluminum';

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

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Slat Stack Preview */}
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
      
      {/* Label */}
      {showLabel && (
        <p className="text-xs text-muted-foreground text-center">
          {slatWidth}mm {getMaterialLabel()}
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
