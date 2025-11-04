import { X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ImagePreview {
  id: string;
  url: string;
  name: string;
  size?: number;
}

interface ImagePreviewGridProps {
  images: ImagePreview[];
  onRemove?: (id: string) => void;
  onView?: (image: ImagePreview) => void;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const ImagePreviewGrid = ({
  images,
  onRemove,
  onView,
  columns = 3,
  className
}: ImagePreviewGridProps) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {images.map((image, index) => (
        <div
          key={image.id}
          className="group relative aspect-video bg-muted rounded-lg overflow-hidden animate-scale-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Image */}
          <img
            src={image.url}
            alt={image.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Actions */}
            <div className="absolute top-2 right-2 flex gap-1">
              {onView && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-background/90 hover:bg-background"
                  onClick={() => onView(image)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onRemove && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 p-0"
                  onClick={() => onRemove(image.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
              <p className="text-sm font-medium text-white truncate">
                {image.name}
              </p>
              {image.size && (
                <Badge variant="secondary" className="text-xs">
                  {formatFileSize(image.size)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
