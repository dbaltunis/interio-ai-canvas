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
      const { data, error } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProjectFile[];
    },
    enabled: !!projectId,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, projectId, bucketName }: { file: File; projectId: string; bucketName: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store file metadata (this would need a project_files table)
      console.log('File uploaded successfully:', fileName);
      
      return { fileName, bucketName };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-files"] });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: any) => {
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
