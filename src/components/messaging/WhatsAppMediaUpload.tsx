import React, { useRef, useState, useCallback } from 'react';
import { Camera, Image as ImageIcon, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WhatsAppMediaUploadProps {
  onMediaUploaded: (url: string) => void;
  currentMediaUrl?: string;
  onRemoveMedia: () => void;
}

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB WhatsApp limit

export const WhatsAppMediaUpload: React.FC<WhatsAppMediaUploadProps> = ({
  onMediaUploaded,
  currentMediaUrl,
  onRemoveMedia,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 16MB.');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `whatsapp-${Date.now()}.${fileExt}`;
      const filePath = `whatsapp-media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('business-assets')
        .getPublicUrl(filePath);

      onMediaUploaded(urlData.publicUrl);
      toast.success('Media uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const isImage = currentMediaUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(currentMediaUrl);

  if (currentMediaUrl) {
    return (
      <div className="relative inline-block">
        {isImage ? (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img 
              src={currentMediaUrl} 
              alt="Attachment" 
              className="h-20 w-20 object-cover"
            />
            <button
              onClick={onRemoveMedia}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-md hover:bg-destructive/90 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="relative flex items-center gap-2 p-2 pr-8 rounded-lg border border-border bg-muted/50">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {currentMediaUrl.split('/').pop()}
            </span>
            <button
              onClick={onRemoveMedia}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-md hover:bg-destructive/90 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center gap-1 transition-colors",
        isDragOver && "bg-green-50 dark:bg-green-950/30 rounded-lg p-1"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isUploading ? (
        <div className="flex items-center gap-2 text-muted-foreground px-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Uploading...</span>
        </div>
      ) : (
        <>
          {/* Camera - mobile capture */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
          </Button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Gallery - image picker */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          {/* Document - file picker */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*,.pdf,.doc,.docx';
                fileInputRef.current.click();
              }
            }}
          >
            <FileText className="h-4 w-4" />
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
};
