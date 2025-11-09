import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Loader2 } from "lucide-react";

interface ScreenshotDisplayProps {
  sectionId: string;
  subsectionId: string;
  adminMode?: boolean;
  onImageLoad?: (url: string) => void;
}

export const ScreenshotDisplay = ({ sectionId, subsectionId, adminMode = false, onImageLoad }: ScreenshotDisplayProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadScreenshot();
  }, [sectionId, subsectionId]);

  const loadScreenshot = async () => {
    setLoading(true);
    setError(false);

    try {
      // Try to find screenshot with different extensions
      const extensions = ['png', 'jpg', 'jpeg', 'webp'];
      
      for (const ext of extensions) {
        const fileName = `${sectionId}/${subsectionId}.${ext}`;
        
        // Check if file exists
        const { data: files, error: listError } = await supabase.storage
          .from('documentation-screenshots')
          .list(sectionId, {
            search: `${subsectionId}.${ext}`
          });

        if (!listError && files && files.length > 0) {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('documentation-screenshots')
            .getPublicUrl(fileName);

          setImageUrl(publicUrl);
          onImageLoad?.(publicUrl);
          setLoading(false);
          return;
        }
      }

      // No screenshot found
      setError(true);
      setLoading(false);
    } catch (err) {
      console.error('Error loading screenshot:', err);
      setError(true);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 p-12 bg-white/[0.08] border border-white/30 rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary/60 animate-spin" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="mt-6 p-12 bg-white/[0.08] border border-white/30 rounded-lg flex items-center justify-center">
        <div className="text-center text-white/70">
          <FileText className="h-16 w-16 mx-auto mb-3 text-white/60" />
          <p className="text-sm font-medium text-white">Screenshot placeholder</p>
          <p className="text-xs mt-2 text-white/60">
            {adminMode ? "Upload a screenshot to display it here" : "Screenshots will be added in future updates"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg overflow-hidden border border-white/20">
      <img
        src={imageUrl}
        alt={`Screenshot for ${subsectionId}`}
        className="w-full h-auto"
        loading="lazy"
      />
    </div>
  );
};
