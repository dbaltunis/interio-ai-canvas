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
  project_id: string | null;
  description: string | null;
  project?: {
    id: string;
    name: string;
  };
}

export const useClientFiles = (clientId: string, userId: string) => {
  return useQuery({
    queryKey: ["client-files", clientId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_files')
        .select(`
          *,
          project:projects(id, name)
        `)
        .eq('client_id', clientId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as ClientFile[];
    },
    enabled: !!clientId && !!userId,
  });
};

export const useUploadClientFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      file, 
      clientId, 
      userId, 
      projectId, 
      description 
    }: { 
      file: File; 
      clientId: string; 
      userId: string; 
      projectId?: string;
      description?: string;
    }) => {
      // Upload to storage
      const fileName = `${userId}/${clientId}/${Date.now()}-${file.name}`;
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('client-files')
        .upload(fileName, file, {
          upsert: false,
          cacheControl: '3600'
        });

      if (storageError) {
        console.error('Upload error:', storageError);
        throw storageError;
      }

      // Create database record
      const { data: dbData, error: dbError } = await supabase
        .from('client_files')
        .insert({
          user_id: userId,
          client_id: clientId,
          project_id: projectId || null,
          file_name: file.name,
          file_path: storageData.path,
          file_size: file.size,
          file_type: file.type,
          bucket_name: 'client-files',
          description: description || null,
        })
        .select()
        .single();

      if (dbError) {
        // Rollback storage upload if database insert fails
        await supabase.storage.from('client-files').remove([storageData.path]);
        throw dbError;
      }

      return dbData;
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
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(file.bucket_name)
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('client_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;
      
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

export const useUpdateClientFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      projectId, 
      description 
    }: { 
      id: string; 
      projectId?: string | null;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('client_files')
        .update({
          project_id: projectId,
          description: description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-files"] });
      toast.success("File updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
};
