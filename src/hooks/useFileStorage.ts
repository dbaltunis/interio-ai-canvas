
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

// Mock data store
let mockProjectFiles: ProjectFile[] = [];

export const useProjectFiles = (projectId: string) => {
  return useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      // Mock implementation
      return mockProjectFiles.filter(file => file.project_id === projectId);
    },
    enabled: !!projectId,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, projectId, bucketName }: { file: File; projectId: string; bucketName: string }) => {
      // Mock implementation
      const fileName = `${projectId}/${Date.now()}-${file.name}`;
      
      const mockFile: ProjectFile = {
        id: `file-${Date.now()}`,
        created_at: new Date().toISOString(),
        file_name: file.name,
        file_path: fileName,
        file_size: file.size,
        file_type: file.type,
        bucket_name: bucketName,
        project_id: projectId,
        user_id: 'mock-user'
      };

      mockProjectFiles.push(mockFile);
      
      console.log('Mock file uploaded:', fileName);
      
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
    mutationFn: async (file: ProjectFile) => {
      // Mock implementation
      const index = mockProjectFiles.findIndex(f => f.id === file.id);
      if (index !== -1) {
        mockProjectFiles.splice(index, 1);
      }
      
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
      // Mock implementation
      return `https://mock-storage.com/${bucketName}/${filePath}`;
    },
  });
};
