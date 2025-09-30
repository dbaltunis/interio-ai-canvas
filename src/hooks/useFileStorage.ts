
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectFile {
  id: string;
  created_at: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  bucket_name: string;
  project_id: string;
  user_id: string;
}

export const useProjectFiles = (projectId: string) => {
  return useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('business-assets')
        .list(`${projectId}/`, {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;

      return data?.map(file => ({
        id: file.id || crypto.randomUUID(),
        created_at: file.created_at,
        file_name: file.name,
        file_path: `${projectId}/${file.name}`,
        file_size: file.metadata?.size || 0,
        file_type: file.metadata?.mimetype || '',
        bucket_name: 'business-assets',
        project_id: projectId,
        user_id: '',
      })) || [];
    },
    enabled: !!projectId,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, projectId, bucketName = 'business-assets' }: { file: File; projectId: string; bucketName?: string }) => {
      const fileName = `${projectId}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          upsert: false
        });

      if (error) throw error;

      return { fileName: data.path, bucketName };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-files"] });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: ProjectFile) => {
      const { error } = await supabase.storage
        .from(file.bucket_name)
        .remove([file.file_path]);

      if (error) throw error;
      
      return file;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-files"] });
    },
  });
};

export const useGetFileUrl = () => {
  return useMutation({
    mutationFn: async ({ bucketName, filePath }: { bucketName: string; filePath: string }) => {
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
  });
};
