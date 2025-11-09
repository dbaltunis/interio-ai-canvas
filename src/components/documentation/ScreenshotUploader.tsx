import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScreenshotUploaderProps {
  sectionId: string;
  subsectionId: string;
  onUploadComplete?: (url: string) => void;
}

export const ScreenshotUploader = ({ sectionId, subsectionId, onUploadComplete }: ScreenshotUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, or WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Generate filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${sectionId}/${subsectionId}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documentation-screenshots')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Replace if exists
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documentation-screenshots')
        .getPublicUrl(fileName);

      setUploadedUrl(publicUrl);
      onUploadComplete?.(publicUrl);

      toast({
        title: "Screenshot uploaded",
        description: "The screenshot has been successfully uploaded",
      });
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload screenshot",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id={`screenshot-${sectionId}-${subsectionId}`}
      />
      <label htmlFor={`screenshot-${sectionId}-${subsectionId}`}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="border-primary/40 bg-primary/10 text-white hover:bg-primary/20 hover:border-primary/60 cursor-pointer transition-all"
          asChild
        >
          <span>
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : uploadedUrl ? (
              <Check className="h-4 w-4 mr-2 text-green-400" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? "Uploading..." : uploadedUrl ? "Uploaded" : "Upload Screenshot"}
          </span>
        </Button>
      </label>
      {uploadedUrl && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setUploadedUrl(null);
            onUploadComplete?.("");
          }}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
