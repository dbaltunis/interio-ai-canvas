import { useState, useCallback } from 'react';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export const useImageOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeImage = useCallback(async (
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<File> => {
    const {
      maxWidth = 1920,
      maxHeight = 1920,
      quality = 0.85,
      format = 'image/jpeg'
    } = options;

    setIsOptimizing(true);

    try {
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        
        reader.onload = (e) => {
          const img = new Image();
          
          img.onerror = () => reject(new Error('Failed to load image'));
          
          img.onload = () => {
            try {
              // Calculate new dimensions
              let { width, height } = img;
              
              if (width > maxWidth || height > maxHeight) {
                const aspectRatio = width / height;
                
                if (width > height) {
                  width = maxWidth;
                  height = width / aspectRatio;
                } else {
                  height = maxHeight;
                  width = height * aspectRatio;
                }
              }

              // Create canvas
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
              }

              // Draw image
              ctx.drawImage(img, 0, 0, width, height);

              // Convert to blob
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error('Failed to create blob'));
                    return;
                  }

                  // Create new file with optimized image
                  const optimizedFile = new File(
                    [blob],
                    file.name.replace(/\.[^/.]+$/, `.${format.split('/')[1]}`),
                    { type: format }
                  );

                  resolve(optimizedFile);
                },
                format,
                quality
              );
            } catch (error) {
              reject(error);
            }
          };

          img.src = e.target?.result as string;
        };

        reader.readAsDataURL(file);
      });
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const optimizeMultipleImages = useCallback(async (
    files: File[],
    options?: ImageOptimizationOptions
  ): Promise<File[]> => {
    setIsOptimizing(true);
    
    try {
      const optimizedFiles = await Promise.all(
        files.map(file => optimizeImage(file, options))
      );
      return optimizedFiles;
    } finally {
      setIsOptimizing(false);
    }
  }, [optimizeImage]);

  return {
    optimizeImage,
    optimizeMultipleImages,
    isOptimizing
  };
};
