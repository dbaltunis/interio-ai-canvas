import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
  size?: "sm" | "md";
}

export const FavoriteButton = ({
  isFavorite,
  onToggle,
  className,
  size = "sm"
}: FavoriteButtonProps) => {
  const sizeClasses = size === "sm" 
    ? "h-6 w-6" 
    : "h-8 w-8";
  
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "flex items-center justify-center rounded-full transition-all",
        "hover:scale-110 active:scale-95",
        sizeClasses,
        isFavorite 
          ? "bg-amber-100 dark:bg-amber-900/50 text-amber-500" 
          : "bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-amber-500",
        className
      )}
    >
      <Star 
        className={cn(
          iconSize,
          "transition-all",
          isFavorite && "fill-amber-500"
        )} 
      />
    </button>
  );
};
