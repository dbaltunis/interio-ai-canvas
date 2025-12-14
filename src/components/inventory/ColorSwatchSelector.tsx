import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Common color mappings for fabric names
const COLOR_MAP: Record<string, string> = {
  // Whites & Creams
  'white': '#FFFFFF',
  'cream': '#FFFDD0',
  'ivory': '#FFFFF0',
  'pearl': '#F5F5F0',
  'snow': '#FFFAFA',
  'alabaster': '#F2F0E6',
  // Grays
  'grey': '#808080',
  'gray': '#808080',
  'silver': '#C0C0C0',
  'charcoal': '#36454F',
  'slate': '#708090',
  'stone': '#928E85',
  'ash': '#B2BEB5',
  'dove': '#646D7E',
  // Blacks
  'black': '#000000',
  'onyx': '#353839',
  'ebony': '#555D50',
  'jet': '#343434',
  // Browns & Beiges
  'beige': '#F5F5DC',
  'tan': '#D2B48C',
  'taupe': '#483C32',
  'brown': '#8B4513',
  'chocolate': '#7B3F00',
  'coffee': '#6F4E37',
  'mocha': '#967117',
  'sand': '#C2B280',
  'camel': '#C19A6B',
  'linen': '#FAF0E6',
  'natural': '#F5F2EB',
  // Reds & Pinks
  'red': '#FF0000',
  'burgundy': '#800020',
  'wine': '#722F37',
  'crimson': '#DC143C',
  'cherry': '#DE3163',
  'rust': '#B7410E',
  'coral': '#FF7F50',
  'pink': '#FFC0CB',
  'rose': '#FF007F',
  'blush': '#DE5D83',
  'salmon': '#FA8072',
  'chilli': '#C21807',
  'cinnamon': '#D2691E',
  // Oranges & Yellows
  'orange': '#FFA500',
  'tangerine': '#FF9966',
  'peach': '#FFCBA4',
  'apricot': '#FBCEB1',
  'yellow': '#FFFF00',
  'gold': '#FFD700',
  'amber': '#FFBF00',
  'mustard': '#FFDB58',
  'honey': '#EB9605',
  'butter': '#FFFF99',
  // Greens
  'green': '#008000',
  'olive': '#808000',
  'sage': '#B2AC88',
  'forest': '#228B22',
  'moss': '#8A9A5B',
  'mint': '#98FF98',
  'teal': '#008080',
  'emerald': '#50C878',
  'lime': '#32CD32',
  'seafoam': '#93E9BE',
  // Blues
  'blue': '#0000FF',
  'navy': '#000080',
  'cobalt': '#0047AB',
  'sky': '#87CEEB',
  'ocean': '#006994',
  'denim': '#1560BD',
  'azure': '#007FFF',
  'indigo': '#4B0082',
  'marine': '#3C6478',
  'midnight': '#191970',
  'steel': '#4682B4',
  // Purples
  'purple': '#800080',
  'lavender': '#E6E6FA',
  'plum': '#8E4585',
  'mauve': '#E0B0FF',
  'violet': '#EE82EE',
  'lilac': '#C8A2C8',
  'grape': '#6F2DA8',
  'amethyst': '#9966CC',
};

const getColorFromName = (name: string): string | null => {
  const lowerName = name.toLowerCase();
  
  // Direct match
  if (COLOR_MAP[lowerName]) {
    return COLOR_MAP[lowerName];
  }
  
  // Check if any color keyword is contained in the name
  for (const [colorName, colorValue] of Object.entries(COLOR_MAP)) {
    if (lowerName.includes(colorName)) {
      return colorValue;
    }
  }
  
  return null;
};

interface ColorSwatchProps {
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ColorSwatch = ({ 
  color, 
  isSelected, 
  onClick, 
  size = 'md',
  showLabel = false 
}: ColorSwatchProps) => {
  const colorValue = getColorFromName(color) || color;
  const isValidColor = colorValue.startsWith('#') || colorValue.startsWith('rgb');
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const content = (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        sizeClasses[size],
        'rounded-full border-2 transition-all relative flex-shrink-0',
        isSelected 
          ? 'border-primary ring-2 ring-primary/30 scale-110' 
          : 'border-border hover:border-primary/50 hover:scale-105',
        onClick && 'cursor-pointer',
        !onClick && 'cursor-default'
      )}
      style={{ 
        backgroundColor: isValidColor ? colorValue : undefined,
        backgroundImage: !isValidColor 
          ? 'linear-gradient(135deg, #ddd 25%, transparent 25%), linear-gradient(225deg, #ddd 25%, transparent 25%), linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(315deg, #ddd 25%, #fff 25%)' 
          : undefined,
        backgroundSize: !isValidColor ? '8px 8px' : undefined,
        backgroundPosition: !isValidColor ? '0 0, 4px 0, 4px -4px, 0 4px' : undefined
      }}
    >
      {isSelected && (
        <Check 
          className={cn(
            "absolute inset-0 m-auto text-white drop-shadow-md",
            size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3.5 h-3.5' : 'w-5 h-5'
          )} 
        />
      )}
    </button>
  );

  if (showLabel || !isValidColor) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {color}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

interface ColorSwatchSelectorProps {
  colors: string[];
  selectedColor?: string | null;
  onColorSelect?: (color: string) => void;
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ColorSwatchSelector = ({ 
  colors, 
  selectedColor,
  onColorSelect,
  maxVisible = 6,
  size = 'sm'
}: ColorSwatchSelectorProps) => {
  const [showAll, setShowAll] = useState(false);
  
  if (!colors || colors.length === 0) return null;

  // Filter out non-color tags (like "blockout", "wide_width", etc.)
  const colorTags = colors.filter(tag => {
    const lower = tag.toLowerCase();
    // Exclude known type tags
    const nonColorTags = ['blockout', 'sheer', 'sunscreen', 'light_filtering', 'dimout', 'thermal', 'wide_width', 'twc'];
    return !nonColorTags.includes(lower) && !lower.includes('_');
  });

  if (colorTags.length === 0) return null;

  const visibleColors = showAll ? colorTags : colorTags.slice(0, maxVisible);
  const hiddenCount = colorTags.length - maxVisible;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visibleColors.map((color, idx) => (
        <ColorSwatch
          key={idx}
          color={color}
          isSelected={selectedColor === color}
          onClick={onColorSelect ? () => onColorSelect(color) : undefined}
          size={size}
          showLabel
        />
      ))}
      {!showAll && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="text-[10px] text-muted-foreground hover:text-foreground px-1"
        >
          +{hiddenCount}
        </button>
      )}
    </div>
  );
};
