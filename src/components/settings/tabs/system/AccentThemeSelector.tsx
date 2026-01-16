import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  AccentTheme, 
  THEME_PALETTES, 
  useAccentTheme, 
  useUpdateAccentTheme 
} from '@/hooks/useAccentTheme';
import { Skeleton } from '@/components/ui/skeleton';

export const AccentThemeSelector = () => {
  const { data: currentTheme, isLoading } = useAccentTheme();
  const updateTheme = useUpdateAccentTheme();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {THEME_PALETTES.map((palette) => {
          const isSelected = currentTheme === palette.id;
          
          return (
            <button
              key={palette.id}
              onClick={() => updateTheme.mutate(palette.id)}
              disabled={updateTheme.isPending}
              className={cn(
                "relative p-3 rounded-lg border-2 transition-all text-left",
                "hover:border-primary/50 hover:shadow-md",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-sm" 
                  : "border-border bg-card"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              
              {/* Palette name */}
              <div className="font-medium text-sm mb-1">{palette.name}</div>
              <p className="text-xs text-muted-foreground mb-3">{palette.description}</p>
              
              {/* Color swatches */}
              <div className="flex gap-1">
                {palette.colors.slice(0, 7).map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-border/50"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Theme changes are saved automatically and persist across sessions
      </p>
    </div>
  );
};
