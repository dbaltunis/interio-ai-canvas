import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuoteCustomData {
  [blockId: string]: {
    images?: Array<{ url: string; caption?: string }>;
    text?: string;
    [key: string]: any;
  };
}

export const useQuoteCustomData = (quoteId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch custom data for a quote
  const { data: customData, isLoading } = useQuery({
    queryKey: ['quote-custom-data', quoteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('template_custom_data')
        .eq('id', quoteId)
        .single();

      if (error) throw error;
      return ((data as any)?.template_custom_data || {}) as QuoteCustomData;
    },
    enabled: !!quoteId,
  });

  // Save custom data for a specific block
  const saveMutation = useMutation({
    mutationFn: async ({ blockId, data }: { blockId: string; data: any }) => {
      const currentData = customData || {};
      const updatedData = {
        ...currentData,
        [blockId]: data,
      };

      const { error } = await supabase
        .from('quotes')
        .update({ template_custom_data: updatedData } as any)
        .eq('id', quoteId);

      if (error) throw error;
      return updatedData;
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['quote-custom-data', quoteId], updatedData);
    },
    onError: (error: any) => {
      toast({
        title: 'Error saving changes',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Upload image to Supabase Storage
  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, blockId }: { file: File; blockId: string }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userId}/${quoteId}/${blockId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('quote-custom-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('quote-custom-images')
        .getPublicUrl(filePath);

      return { url: publicUrl, caption: file.name };
    },
    onError: (error: any) => {
      toast({
        title: 'Error uploading image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete image from Supabase Storage
  const deleteImageMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      // Extract file path from public URL
      const urlParts = imageUrl.split('/quote-custom-images/');
      if (urlParts.length < 2) throw new Error('Invalid image URL');
      
      const filePath = urlParts[1].split('?')[0]; // Remove query params if any

      const { error } = await supabase.storage
        .from('quote-custom-images')
        .remove([filePath]);

      if (error) throw error;
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    customData,
    isLoading,
    saveBlockData: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    uploadImage: uploadImageMutation.mutateAsync,
    isUploading: uploadImageMutation.isPending,
    deleteImage: deleteImageMutation.mutateAsync,
    isDeleting: deleteImageMutation.isPending,
  };
};
