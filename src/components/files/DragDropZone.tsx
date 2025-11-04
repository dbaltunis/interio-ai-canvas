import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

interface DragDropZoneProps {
  onFilesDropped: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const DragDropZone = ({
  onFilesDropped,
  accept = "image/*",
  multiple = true,
  disabled = false,
  children,
  className
}: DragDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFilesDropped(files);
    }
  }, [disabled, onFilesDropped]);

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative transition-all duration-200",
        isDragging && !disabled && "ring-2 ring-primary ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
      
      {isDragging && !disabled && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-50 pointer-events-none animate-fade-in">
          <div className="text-center space-y-2">
            <Upload className="h-12 w-12 mx-auto text-primary animate-bounce" />
            <p className="text-base font-medium text-primary">
              Drop {multiple ? 'files' : 'file'} here
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
