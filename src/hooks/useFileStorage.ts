
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProjectFile {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  bucket_name: string;
  created_at: string;
  updated_at: string;
}

export const useProjectFiles = (projectId: string) => {
  return useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      // For now, let's return an empty array as we don't have project_files table
      // This will prevent the error in DocumentManagement
      return [] as ProjectFile[];
    },
    enabled: !!projectId,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, projectId, bucketName = 'project-documents' }: { 
      file: File; 
      projectId: string; 
      bucketName?: string;
    }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return {
        fileName: file.name,
        filePath: fileName,
        publicUrl: data.publicUrl,
        fileSize: file.size,
        fileType: file.type
      };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    },
    onError: (error) => {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    },
  });
};
