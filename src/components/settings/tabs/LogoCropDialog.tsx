
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crop, Upload, X, Info } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface LogoCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (croppedFile: File) => void;
}

export const LogoCropDialog = ({ open, onOpenChange, onCropComplete }: LogoCropDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (PNG, JPG, or SVG)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleImageLoad = () => {
    if (!imageRef.current) return;
    
    const img = imageRef.current;
    const aspectRatio = 200 / 60; // Target aspect ratio
    
    // Center the crop area and maintain aspect ratio
    const maxWidth = Math.min(img.naturalWidth, img.naturalHeight * aspectRatio);
    const maxHeight = maxWidth / aspectRatio;
    
    setCropArea({
      x: (img.naturalWidth - maxWidth) / 2,
      y: (img.naturalHeight - maxHeight) / 2,
      width: maxWidth,
      height: maxHeight
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    
    const deltaX = (e.clientX - dragStart.x) * scaleX;
    const deltaY = (e.clientY - dragStart.y) * scaleY;
    
    setCropArea(prev => {
      const newX = Math.max(0, Math.min(prev.x + deltaX, imageRef.current!.naturalWidth - prev.width));
      const newY = Math.max(0, Math.min(prev.y + deltaY, imageRef.current!.naturalHeight - prev.height));
      
      return { ...prev, x: newX, y: newY };
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const cropAndSaveLogo = async () => {
    if (!selectedFile || !imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to target size (200x60)
    canvas.width = 200;
    canvas.height = 60;

    // Draw the cropped portion
    ctx.drawImage(
      imageRef.current,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, 200, 60
    );

    // Convert to blob with reduced quality
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const croppedFile = new File([blob], `logo-${Date.now()}.png`, {
        type: 'image/png'
      });
      
      onCropComplete(croppedFile);
      handleClose();
      
      toast({
        title: "Logo Cropped",
        description: `Logo has been resized to 200x60px and optimized for documents.`,
      });
    }, 'image/png', 0.7); // Reduced quality to 70%
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setCropArea({ x: 0, y: 0, width: 200, height: 60 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5 text-brand-primary" />
            Logo Cropper - Professional Standards
          </DialogTitle>
          <DialogDescription>
            Upload and crop your logo to exactly 200x60 pixels for professional documents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedFile ? (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Your logo will be automatically resized to 200x60 pixels and optimized for quotes and documents. Quality will be reduced to ensure fast loading.
                </AlertDescription>
              </Alert>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Your Logo</h3>
                <p className="text-gray-500 mb-4">
                  Select an image file to crop to professional standards
                </p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-brand-primary hover:bg-brand-accent"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <Crop className="h-4 w-4" />
                <AlertDescription>
                  <strong>Crop Instructions:</strong> Drag the blue frame to position your logo. The selected area will be resized to 200x60 pixels.
                </AlertDescription>
              </Alert>

              <div className="relative border rounded-lg overflow-hidden bg-gray-50">
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Logo preview"
                  className="max-w-full h-auto"
                  onLoad={handleImageLoad}
                />
                
                {/* Crop overlay */}
                {imageRef.current && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-20 cursor-move"
                    style={{
                      left: `${(cropArea.x / imageRef.current.naturalWidth) * 100}%`,
                      top: `${(cropArea.y / imageRef.current.naturalHeight) * 100}%`,
                      width: `${(cropArea.width / imageRef.current.naturalWidth) * 100}%`,
                      height: `${(cropArea.height / imageRef.current.naturalHeight) * 100}%`,
                    }}
                    onMouseDown={handleMouseDown}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-blue-700 font-medium text-sm bg-white px-2 py-1 rounded">
                        200x60px
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview of cropped result */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-medium mb-2">Preview (Final Result):</h4>
                <div className="border border-gray-200 inline-block">
                  <canvas
                    ref={canvasRef}
                    className="block border"
                    style={{ width: '200px', height: '60px' }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  This is how your logo will appear in documents (200x60px, optimized quality)
                </p>
              </div>

              <div className="flex justify-between space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Choose Different Image
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={cropAndSaveLogo}
                    className="bg-brand-primary hover:bg-brand-accent"
                  >
                    <Crop className="h-4 w-4 mr-2" />
                    Crop & Save Logo
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
