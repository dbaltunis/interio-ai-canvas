import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientFile {
  id: string;
  created_at: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  bucket_name: string;
}

export const useClientFiles = (clientId: string, userId: string) => {
  return useQuery({
    queryKey: ["client-files", clientId, userId],
    queryFn: async () => {
      const folderPath = `${userId}/${clientId}/`;
      
      const { data, error } = await supabase.storage
        .from('client-files')
        .list(folderPath, {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;

      return data?.map(file => ({
        id: file.id || crypto.randomUUID(),
        created_at: file.created_at,
        file_name: file.name,
        file_path: `${folderPath}${file.name}`,
        file_size: file.metadata?.size || 0,
        file_type: file.metadata?.mimetype || '',
        bucket_name: 'client-files',
      })) || [];
    },
    enabled: !!clientId && !!userId,
  });
};

export const useUploadClientFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, clientId, userId }: { file: File; clientId: string; userId: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${clientId}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('client-files')
        .upload(fileName, file, {
          upsert: false,
          cacheControl: '3600'
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      return { fileName: data.path, bucketName: 'client-files' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-files"] });
      toast.success("File uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });
};

export const useDeleteClientFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: ClientFile) => {
      const { error } = await supabase.storage
        .from(file.bucket_name)
        .remove([file.file_path]);

      if (error) throw error;
      
      return file;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-files"] });
      toast.success("File deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });
};

export const useGetClientFileUrl = () => {
  return useMutation({
    mutationFn: async ({ bucketName, filePath }: { bucketName: string; filePath: string }) => {
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
  });
};
