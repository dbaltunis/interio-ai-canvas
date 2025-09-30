import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimpleLogoUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (file: File) => void;
}

export const SimpleLogoUpload: React.FC<SimpleLogoUploadProps> = ({
  open,
  onOpenChange,
  onUploadComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (PNG, JPG, JPEG, or WebP)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    onUploadComplete(selectedFile);
    handleClose();
    
    toast({
      title: "Success",
      description: "Logo uploaded successfully!",
    });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Company Logo</DialogTitle>
          <DialogDescription>
            Choose a logo image. We'll automatically optimize it for your business settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select Logo Image</h3>
              <p className="text-gray-500 mb-4">
                PNG, JPG, or WebP (max 5MB)
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-brand-primary hover:bg-brand-accent"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Preview</h4>
                <div className="bg-gray-50 border border-gray-200 rounded overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Logo preview"
                    className="w-full h-32 object-contain"
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>File:</strong> {selectedFile.name}</p>
                  <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={selectedFile ? () => {
              setSelectedFile(null);
              setPreviewUrl("");
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            } : handleClose}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            {selectedFile ? 'Choose Different' : 'Cancel'}
          </Button>
          
          {selectedFile && (
            <Button 
              onClick={handleUpload}
              className="flex-1 bg-brand-primary hover:bg-brand-accent"
            >
              <Check className="h-4 w-4 mr-2" />
              Use This Logo
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};