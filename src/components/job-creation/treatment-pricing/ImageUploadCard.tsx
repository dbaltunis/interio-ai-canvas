
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";

interface ImageUploadCardProps {
  images: File[];
  onImageUpload: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
}

export const ImageUploadCard = ({ images, onImageUpload, onRemoveImage }: ImageUploadCardProps) => {
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }
            
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  reject(new Error('Failed to create compressed blob'));
                }
              },
              'image/jpeg',
              0.6
            );
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const compressedFiles = await Promise.all(
      files.map(file => file.type.startsWith('image/') ? compressImage(file) : Promise.resolve(file))
    );
    onImageUpload(compressedFiles);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workroom Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Click to upload images for the workroom team
            </p>
          </label>
        </div>
        
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
