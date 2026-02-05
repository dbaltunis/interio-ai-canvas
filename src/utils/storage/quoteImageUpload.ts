import { supabase } from "@/integrations/supabase/client";

/**
 * Upload an image for a quote line item
 * @param projectId The project ID
 * @param itemId The quote item/window ID
 * @param file The image file to upload
 * @returns The public URL of the uploaded image
 */
export const uploadQuoteItemImage = async (
  projectId: string,
  itemId: string,
  file: File
): Promise<string> => {
  // Sanitize filename
  const sanitizedName = file.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[–—]/g, '-') // Replace en/em dashes
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, ''); // Remove other special chars

  const timestamp = Date.now();
  const filePath = `${projectId}/${itemId}/${timestamp}_${sanitizedName}`;

  const { data, error } = await supabase.storage
    .from('quote-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Quote image upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('quote-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

/**
 * Delete a quote item image
 * @param filePath The file path in the bucket
 */
export const deleteQuoteItemImage = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('quote-images')
    .remove([filePath]);

  if (error) {
    console.error('Quote image delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Extract file path from a public URL
 */
export const extractFilePathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const match = urlObj.pathname.match(/\/quote-images\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};
