import { useState } from "react";
import { EnhancedImageUpload } from "./EnhancedImageUpload";
import { ImagePreviewGrid } from "./ImagePreviewGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const ImageUploadDemo = () => {
  const [uploadedImages, setUploadedImages] = useState<Array<{
    id: string;
    url: string;
    name: string;
    size: number;
  }>>([]);

  const handleUploadComplete = (urls: string[]) => {
    // In real app, these would be the uploaded file URLs from storage
    const newImages = urls.map((url, index) => ({
      id: `${Date.now()}-${index}`,
      url,
      name: `image-${index}.jpg`,
      size: 0
    }));
    
    setUploadedImages(prev => [...prev, ...newImages]);
    toast.success(`${urls.length} image(s) uploaded successfully`);
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
    toast.success('Image removed');
  };

  const handleViewImage = (image: any) => {
    window.open(image.url, '_blank');
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Enhanced Image Upload</h1>
        <p className="text-muted-foreground">
          Drag & drop images, see live previews, and track upload progress
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList>
          <TabsTrigger value="upload">Upload Images</TabsTrigger>
          <TabsTrigger value="gallery">
            Gallery {uploadedImages.length > 0 && `(${uploadedImages.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <EnhancedImageUpload
            projectId="demo-project"
            onUploadComplete={handleUploadComplete}
            maxFiles={10}
            maxSizeMB={5}
            showPreview={true}
          />

          {/* Features Info */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>What's included in this enhanced uploader</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Drag & drop support with visual feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Live image previews before upload</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Individual file progress tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>File size and type validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Multiple file uploads</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Error handling with clear messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Smooth animations and transitions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Responsive design for all devices</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          {uploadedImages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No images uploaded yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload some images to see them here
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Images</CardTitle>
                <CardDescription>
                  {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} in gallery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImagePreviewGrid
                  images={uploadedImages}
                  onRemove={handleRemoveImage}
                  onView={handleViewImage}
                  columns={3}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
