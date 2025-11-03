import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  bucket?: string;
  folder?: string;
  aspectRatio?: string;
  className?: string;
}

export const ImageUpload = ({
  currentImageUrl,
  onImageUploaded,
  bucket = 'treatment-images',
  folder = 'options',
  aspectRatio = 'aspect-square',
  className
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setPreviewUrl(publicUrl);
      onImageUploaded(publicUrl);

      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
    onImageUploaded('');
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn(
        'relative border-2 border-dashed rounded-lg overflow-hidden transition-colors',
        aspectRatio,
        previewUrl ? 'border-primary' : 'border-muted-foreground/25 hover:border-primary/50'
      )}>
        {previewUrl ? (
          <div className="relative w-full h-full group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/5 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload</span>
                <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
              </>
            )}
          </label>
        )}
      </div>
    </div>
  );
};
