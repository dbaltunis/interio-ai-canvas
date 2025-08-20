/**
 * Utility functions for image processing and optimization
 */

interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

/**
 * Compresses and resizes an image file to reduce its size
 * @param file - The original image file
 * @param options - Compression options
 * @returns Promise<File> - The compressed image file
 */
export const compressImage = async (
  file: File, 
  options: CompressImageOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = maxWidth;
          height = maxWidth / aspectRatio;
        } else {
          height = maxHeight;
          width = maxHeight * aspectRatio;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx!.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Create new file with compressed data
          const compressedFile = new File(
            [blob], 
            file.name.replace(/\.[^/.]+$/, `.${format === 'jpeg' ? 'jpg' : format}`),
            {
              type: `image/${format}`,
              lastModified: Date.now(),
            }
          );

          resolve(compressedFile);
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Checks if a file needs compression based on size
 * @param file - The file to check
 * @param maxSizeKB - Maximum size in KB (default: 2048 = 2MB)
 * @returns boolean
 */
export const needsCompression = (file: File, maxSizeKB: number = 2048): boolean => {
  return file.size > maxSizeKB * 1024;
};

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns string - Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};