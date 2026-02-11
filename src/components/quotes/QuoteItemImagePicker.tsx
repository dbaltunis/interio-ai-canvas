import React, { useState, useRef, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, Image as ImageIcon, X, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { compressImage } from "@/utils/imageUtils";

interface QuoteItemImagePickerProps {
  currentImageUrl?: string | null;
  itemId: string;
  itemName: string;
  onImageChange: (newUrl: string | null) => void;
  disabled?: boolean;
  size?: number;
}

export const QuoteItemImagePicker: React.FC<QuoteItemImagePickerProps> = ({
  currentImageUrl,
  itemId,
  itemName,
  onImageChange,
  disabled = false,
  size = 80,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch library images lazily when popover opens
  const { data: libraryImages, isLoading: isLoadingLibrary } = useQuery({
    queryKey: ["inventory-images-library", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("enhanced_inventory_items")
        .select("id, name, image_url, category, subcategory")
        .not("image_url", "is", null)
        .eq("active", true)
        .order("name")
        .limit(60);

      if (searchQuery.trim()) {
        query = query.ilike("name", `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching library images:", error);
        return [];
      }
      return data || [];
    },
    enabled: isOpen,
    staleTime: 30000,
  });

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Compress for quote display (600px max, good quality)
      const compressed = await compressImage(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.85,
        format: "jpeg",
      });

      const fileExt = "jpg";
      const filePath = `${user.id}/quote-items/${itemId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("treatment-images")
        .upload(filePath, compressed, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("treatment-images")
        .getPublicUrl(filePath);

      onImageChange(publicUrl);
      setIsOpen(false);
      toast.success("Image uploaded");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image", { description: err.message });
    } finally {
      setIsUploading(false);
    }
  }, [itemId, onImageChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleLibrarySelect = (imageUrl: string) => {
    onImageChange(imageUrl);
    setIsOpen(false);
    toast.success("Image selected from library");
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            flexShrink: 0,
            borderRadius: "4px",
            border: "1px dashed #ccc",
            overflow: "hidden",
            cursor: disabled ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f9fafb",
            position: "relative",
          }}
          title={currentImageUrl ? "Click to change image" : "Click to add image"}
        >
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={itemName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Camera style={{ width: "24px", height: "24px", color: "#9ca3af" }} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="right">
        <Tabs defaultValue="upload" className="w-full">
          <div className="px-3 pt-3 pb-1">
            <h4 className="text-sm font-medium mb-2">Product Image</h4>
            <TabsList className="w-full">
              <TabsTrigger value="upload" className="flex-1 text-xs">
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="library" className="flex-1 text-xs">
                <ImageIcon className="h-3 w-3 mr-1" />
                Library
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="px-3 pb-3 mt-0">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Drop image here or click to browse
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    JPEG, PNG, WebP - max 10MB
                  </span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = "";
              }}
            />
          </TabsContent>

          <TabsContent value="library" className="px-3 pb-3 mt-0">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {isLoadingLibrary ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : libraryImages && libraryImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {libraryImages.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="relative aspect-square rounded-md overflow-hidden border hover:border-primary hover:ring-1 hover:ring-primary transition-all group"
                      onClick={() => handleLibrarySelect(item.image_url!)}
                      title={item.name}
                    >
                      <img
                        src={item.image_url!}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] text-white truncate block">{item.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  {searchQuery ? "No matching products found" : "No product images in library"}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Remove image button */}
        {currentImageUrl && (
          <div className="border-t px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-destructive hover:text-destructive"
              onClick={handleRemoveImage}
            >
              <X className="h-3 w-3 mr-1" />
              Remove image
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
