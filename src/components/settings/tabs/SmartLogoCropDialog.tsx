import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, Wand2, Square, Circle, RectangleHorizontal, X, Info, Loader2 } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Canvas as FabricCanvas, FabricImage } from "fabric";
import { pipeline, env } from '@huggingface/transformers';

interface SmartLogoCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (croppedFile: File) => void;
}

type LogoFormat = {
  name: string;
  width: number;
  height: number;
  description: string;
  icon: React.ComponentType<any>;
};

const logoFormats: LogoFormat[] = [
  { name: "Wide Banner", width: 200, height: 80, description: "Perfect for headers", icon: RectangleHorizontal },
  { name: "Square", width: 120, height: 120, description: "Social media ready", icon: Square },
  { name: "Compact", width: 150, height: 60, description: "Minimal space", icon: RectangleHorizontal },
];

export const SmartLogoCropDialog = ({ open, onOpenChange, onCropComplete }: SmartLogoCropDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<LogoFormat>(logoFormats[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>("");
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Configure transformers.js
  useEffect(() => {
    env.allowLocalModels = false;
    env.useBrowserCache = false;
  }, []);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || !open) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 300,
      backgroundColor: "#f8f9fa",
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [open]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    setProcessedImageUrl("");
    
    // Auto-load original image to canvas after a brief delay to ensure canvas is ready
    setTimeout(() => {
      if (fabricCanvas) {
        loadImageToCanvas(url);
      }
    }, 100);
  };

  const loadImageToCanvas = async (imageUrl: string) => {
    if (!fabricCanvas) return;

    try {
      const img = await FabricImage.fromURL(imageUrl);
      
      // Scale image to fit canvas while maintaining aspect ratio
      const canvasWidth = fabricCanvas.width!;
      const canvasHeight = fabricCanvas.height!;
      const imageAspect = img.width! / img.height!;
      const canvasAspect = canvasWidth / canvasHeight;

      let scale;
      if (imageAspect > canvasAspect) {
        scale = canvasWidth / img.width!;
      } else {
        scale = canvasHeight / img.height!;
      }

      img.scale(scale * 0.8); // Leave some padding
      
      // Center the image manually
      const canvasCenter = fabricCanvas.getCenterPoint();
      img.left = canvasCenter.x - (img.width! * img.scaleX!) / 2;
      img.top = canvasCenter.y - (img.height! * img.scaleY!) / 2;
      
      fabricCanvas.clear();
      fabricCanvas.add(img);
      fabricCanvas.renderAll();
      
      // Update preview
      updatePreview();
    } catch (error) {
      console.error('Error loading image to canvas:', error);
      toast({
        title: "Error",
        description: "Failed to load image to editor",
        variant: "destructive",
      });
    }
  };

  const loadImage = (file: Blob): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const removeBackground = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      // Load image
      const imageElement = await loadImage(selectedFile);
      
      // Create a canvas to resize if needed
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const MAX_DIMENSION = 1024;
      let { width, height } = imageElement;
      
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(imageElement, 0, 0, width, height);

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Load the segmentation model
      const segmenter = await pipeline(
        'image-segmentation', 
        'Xenova/segformer-b0-finetuned-ade-512-512',
        { device: 'webgpu' }
      );
      
      const result = await segmenter(imageData);
      
      if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
        throw new Error('Invalid segmentation result');
      }
      
      // Create output canvas with transparent background
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = width;
      outputCanvas.height = height;
      const outputCtx = outputCanvas.getContext('2d');
      
      if (!outputCtx) throw new Error('Could not get output canvas context');
      
      // Draw original image
      outputCtx.drawImage(canvas, 0, 0);
      
      // Apply the mask
      const outputImageData = outputCtx.getImageData(0, 0, width, height);
      const data = outputImageData.data;
      
      // Apply inverted mask to alpha channel (keep subject, remove background)
      for (let i = 0; i < result[0].mask.data.length; i++) {
        const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
        data[i * 4 + 3] = alpha;
      }
      
      outputCtx.putImageData(outputImageData, 0, 0);
      
      // Convert to blob and create URL
      const blob = await new Promise<Blob>((resolve) => {
        outputCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png', 1.0);
      });
      
      const processedUrl = URL.createObjectURL(blob);
      setProcessedImageUrl(processedUrl);
      await loadImageToCanvas(processedUrl);
      
      toast({
        title: "Background Removed",
        description: "Logo is ready for cropping and positioning",
      });
    } catch (error) {
      console.error('Background removal error:', error);
      // Fallback to original image
      const fallbackUrl = URL.createObjectURL(selectedFile);
      setProcessedImageUrl(fallbackUrl);
      await loadImageToCanvas(fallbackUrl);
      
      toast({
        title: "Loaded Original",
        description: "Background removal is not available, but you can still crop and position your logo",
        variant: "default",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const autoFitLogo = () => {
    if (!fabricCanvas) return;

    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) return;

    const obj = objects[0];
    if (!obj) return;

    // Auto-center and scale to fit the selected format
    const targetWidth = selectedFormat.width;
    const targetHeight = selectedFormat.height;
    const objAspect = obj.width! / obj.height!;
    const targetAspect = targetWidth / targetHeight;

    let scale;
    if (objAspect > targetAspect) {
      scale = (targetWidth * 0.8) / obj.width!;
    } else {
      scale = (targetHeight * 0.8) / obj.height!;
    }

    obj.scale(scale);
    
    // Center the object manually
    const canvasCenter = fabricCanvas.getCenterPoint();
    obj.left = canvasCenter.x - (obj.width! * obj.scaleX!) / 2;
    obj.top = canvasCenter.y - (obj.height! * obj.scaleY!) / 2;
    
    fabricCanvas.renderAll();
    updatePreview();

    toast({
      title: "Auto-Fit Applied",
      description: "Logo has been automatically positioned and sized",
    });
  };

  const generateLogo = async () => {
    if (!fabricCanvas && !previewUrl) return;

    try {
      // Create a temporary canvas for the final output
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = selectedFormat.width;
      outputCanvas.height = selectedFormat.height;
      const ctx = outputCanvas.getContext('2d');
      
      if (!ctx) return;

      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, selectedFormat.width, selectedFormat.height);

      let imageSource = '';
      
      // If canvas has objects, use canvas content, otherwise use original/processed image
      if (fabricCanvas && fabricCanvas.getObjects().length > 0) {
        imageSource = fabricCanvas.toDataURL({
          format: 'png',
          quality: 1.0,
          multiplier: 1
        });
      } else {
        // Use processed image if available, otherwise use original
        imageSource = processedImageUrl || previewUrl;
      }

      const img = new Image();
      img.onload = () => {
        // Calculate scaling to fit the format while maintaining aspect ratio
        const imgAspect = img.width / img.height;
        const formatAspect = selectedFormat.width / selectedFormat.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > formatAspect) {
          drawWidth = selectedFormat.width * 0.9; // Leave some padding
          drawHeight = drawWidth / imgAspect;
          drawX = selectedFormat.width * 0.05;
          drawY = (selectedFormat.height - drawHeight) / 2;
        } else {
          drawHeight = selectedFormat.height * 0.9; // Leave some padding
          drawWidth = drawHeight * imgAspect;
          drawY = selectedFormat.height * 0.05;
          drawX = (selectedFormat.width - drawWidth) / 2;
        }
        
        // Draw the image centered and scaled
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        // Convert to blob
        outputCanvas.toBlob((blob) => {
          if (!blob) return;
          
          const croppedFile = new File([blob], `logo-${selectedFormat.name.toLowerCase().replace(' ', '-')}-${Date.now()}.png`, {
            type: 'image/png'
          });
          
          onCropComplete(croppedFile);
          handleClose();
          
          toast({
            title: "Logo Generated",
            description: `${selectedFormat.name} logo (${selectedFormat.width}x${selectedFormat.height}px) created successfully`,
          });
        }, 'image/png', 0.9);
      };
      img.src = imageSource;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate logo",
        variant: "destructive",
      });
    }
  };

  const updatePreview = useCallback(() => {
    if (!fabricCanvas) return;
    
    // Generate preview with current canvas state
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = selectedFormat.width;
    previewCanvas.height = selectedFormat.height;
    const previewCtx = previewCanvas.getContext('2d');
    
    if (!previewCtx) return;
    
    // White background for preview
    previewCtx.fillStyle = '#ffffff';
    previewCtx.fillRect(0, 0, selectedFormat.width, selectedFormat.height);
    
    // Get current canvas content and scale to preview size
    const canvasDataUrl = fabricCanvas.toDataURL({ 
      format: 'png', 
      quality: 0.8, 
      multiplier: 1 
    });
    const img = new Image();
    img.onload = () => {
      previewCtx.drawImage(img, 0, 0, selectedFormat.width, selectedFormat.height);
      setPreviewDataUrl(previewCanvas.toDataURL());
    };
    img.src = canvasDataUrl;
  }, [fabricCanvas, selectedFormat]);

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setProcessedImageUrl("");
    setPreviewDataUrl("");
    setFabricCanvas(null);
    onOpenChange(false);
  };

  // Load image to canvas when processed image is ready
  useEffect(() => {
    if (processedImageUrl && fabricCanvas) {
      loadImageToCanvas(processedImageUrl);
    }
  }, [processedImageUrl, fabricCanvas]);

  // Update preview when format changes
  useEffect(() => {
    updatePreview();
  }, [selectedFormat, updatePreview]);

  // Add canvas event listeners for real-time preview updates
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleObjectModified = () => {
      updatePreview();
    };

    fabricCanvas.on('object:modified', handleObjectModified);
    fabricCanvas.on('object:moving', handleObjectModified);
    fabricCanvas.on('object:scaling', handleObjectModified);

    return () => {
      fabricCanvas.off('object:modified', handleObjectModified);
      fabricCanvas.off('object:moving', handleObjectModified);
      fabricCanvas.off('object:scaling', handleObjectModified);
    };
  }, [fabricCanvas, updatePreview]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-brand-primary" />
            Smart Logo Editor - No External Tools Needed
          </DialogTitle>
          <DialogDescription>
            Upload any logo and we'll automatically optimize it for your needs. After upload, use "Smart Process" for background removal or "Load Original" to start editing immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!selectedFile ? (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Smart Features:</strong> Automatic background removal, smart cropping, and multiple format options. No need for external tools!
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
                  Any format, any background - we'll handle the rest
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel - Original Image & Processing */}
              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Original Image</h4>
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Original logo"
                      className="w-full h-48 object-contain bg-gray-50"
                    />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Button
                      onClick={removeBackground}
                      disabled={isProcessing}
                      className="w-full"
                      variant="outline"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      {isProcessing ? 'Processing...' : 'Smart Process & Load to Editor'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => loadImageToCanvas(previewUrl)}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Load Original to Editor
                    </Button>
                  </div>
                </div>

                {/* Format Selection */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Choose Format</h4>
                  <div className="space-y-2">
                    {logoFormats.map((format) => {
                      const IconComponent = format.icon;
                      return (
                        <button
                          key={format.name}
                          onClick={() => setSelectedFormat(format)}
                          className={`w-full p-3 rounded-lg border text-left transition-colors ${
                            selectedFormat.name === format.name
                              ? 'border-brand-primary bg-brand-primary/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-5 w-5" />
                            <div>
                              <div className="font-medium">{format.name}</div>
                              <div className="text-sm text-gray-500">
                                {format.width}x{format.height}px - {format.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Panel - Editor */}
              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Logo Editor</h4>
                    {fabricCanvas && fabricCanvas.getObjects().length === 0 && (
                      <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        Click "Load Original" to start editing
                      </span>
                    )}
                    <Button
                      onClick={autoFitLogo}
                      size="sm"
                      variant="outline"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Auto-Fit
                    </Button>
                  </div>
                  
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      className="w-full"
                    />
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-2">
                    Drag to move, resize corners to scale. Use Auto-Fit for perfect positioning.
                  </p>
                </div>

                {/* Preview */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium mb-3">
                    Preview - {selectedFormat.name} ({selectedFormat.width}x{selectedFormat.height}px)
                  </h4>
                  <div 
                    className="border border-gray-200 bg-gray-50 rounded mx-auto flex items-center justify-center"
                    style={{ 
                      width: Math.min(selectedFormat.width, 200), 
                      height: Math.min(selectedFormat.height, 200 * (selectedFormat.height / selectedFormat.width))
                    }}
                  >
                    {previewDataUrl ? (
                      <img 
                        src={previewDataUrl} 
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm">
                        Live preview
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Final output preview
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedFile) {
                  setSelectedFile(null);
                  setPreviewUrl("");
                  setProcessedImageUrl("");
                } else {
                  handleClose();
                }
              }}
            >
              <X className="h-4 w-4 mr-2" />
              {selectedFile ? 'Choose Different Image' : 'Cancel'}
            </Button>
            
            {selectedFile && (
              <Button 
                onClick={generateLogo}
                className="bg-brand-primary hover:bg-brand-accent"
                disabled={!fabricCanvas || (!fabricCanvas.getObjects().length && !previewUrl)}
              >
                <Download className="h-4 w-4 mr-2" />
                Generate {selectedFormat.name} Logo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};