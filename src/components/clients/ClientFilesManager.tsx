import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, File, Image, FileText, Trash2, Eye, FolderOpen, Filter } from "lucide-react";
import { useClientFiles, useUploadClientFile, useDeleteClientFile, useGetClientFileUrl } from "@/hooks/useClientFiles";
import { useClientJobs } from "@/hooks/useClientJobs";
import { toast } from "sonner";
import { FileViewerDialog } from "./FileViewerDialog";

interface ClientFilesManagerProps {
  clientId: string;
  userId: string;
}

export const ClientFilesManager = ({ clientId, userId }: ClientFilesManagerProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("none");
  const [filterProjectId, setFilterProjectId] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<{ url: string; name: string; type: string } | null>(null);

  const { data: files, isLoading } = useClientFiles(clientId, userId);
  const { data: projects } = useClientJobs(clientId);
  const uploadFile = useUploadClientFile();
  const deleteFile = useDeleteClientFile();
  const getFileUrl = useGetClientFileUrl();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        await uploadFile.mutateAsync({
          file: selectedFiles[i],
          clientId,
          userId,
          projectId: selectedProjectId === "none" ? undefined : selectedProjectId,
        });
      }
      setSelectedFiles(null);
      setSelectedProjectId("none");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDelete = async (file: any) => {
    if (confirm(`Are you sure you want to delete ${file.file_name}?`)) {
      await deleteFile.mutateAsync(file);
    }
  };

  const handleViewFile = async (file: any) => {
    try {
      const url = await getFileUrl.mutateAsync({
        bucketName: file.bucket_name,
        filePath: file.file_path,
      });
      setCurrentFile({
        url,
        name: file.file_name,
        type: file.file_type,
      });
      setViewerOpen(true);
    } catch (error) {
      toast.error("Failed to open file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // Filter files by project
  const filteredFiles = files?.filter(file => {
    if (filterProjectId === "all") return true;
    if (filterProjectId === "none") return !file.project_id;
    return file.project_id === filterProjectId;
  });

  // Group files by project for display
  const filesByProject = filteredFiles?.reduce((acc, file) => {
    const key = file.project_id || 'general';
    if (!acc[key]) acc[key] = [];
    acc[key].push(file);
    return acc;
  }, {} as Record<string, typeof files>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Client Files & Documents
          </CardTitle>
          
          {/* Filter */}
          {files && files.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterProjectId} onValueChange={setFilterProjectId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="none">General (No Project)</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section with Clear Steps */}
        <div className="space-y-4 p-5 border rounded-lg bg-card">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-base mb-1">Upload New Files</h3>
              <p className="text-sm text-muted-foreground">Follow these steps to upload files for this client</p>
            </div>
          </div>

          {/* Step 1: Choose Files */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${selectedFiles && selectedFiles.length > 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                1
              </div>
              <span className="font-medium">Choose files from your computer</span>
            </div>
            <div className="ml-8">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="w-full text-sm"
              />
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-2 flex items-center gap-2 text-sm text-accent">
                  <File className="h-4 w-4" />
                  <span className="font-medium">✓ {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Select Project */}
          <div className={`space-y-2 ${!selectedFiles || selectedFiles.length === 0 ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${selectedProjectId !== "none" ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                2
              </div>
              <span className="font-medium">Link to a project (optional)</span>
            </div>
            <div className="ml-8">
              <Select 
                value={selectedProjectId} 
                onValueChange={(value) => {
                  setSelectedProjectId(value);
                  const projectName = value === "none" 
                    ? "General (No Project)" 
                    : projects?.find(p => p.id === value)?.name || "Selected Project";
                  toast.success(`Linked to: ${projectName}`);
                }}
                disabled={!selectedFiles || selectedFiles.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="General (No Project)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General (No Project)</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProjectId !== "none" && (
                <div className="mt-2 flex items-center gap-2 text-sm text-accent">
                  <Badge variant="secondary" className="text-xs">
                    ✓ {projects?.find(p => p.id === selectedProjectId)?.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Upload */}
          <div className={`space-y-2 ${!selectedFiles || selectedFiles.length === 0 ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">
                3
              </div>
              <span className="font-medium">Click upload to complete</span>
            </div>
            <div className="ml-8">
              <Button
                onClick={handleUpload}
                disabled={!selectedFiles || uploadFile.isPending}
                size="lg"
                className="w-full sm:w-auto px-8"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadFile.isPending ? 'Uploading...' : 'Upload Files'}
              </Button>
            </div>
          </div>
        </div>

        {/* Files List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading files...
          </div>
        ) : !filteredFiles || filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <File className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No files uploaded yet</p>
            <p className="text-sm mt-1">Upload photos of windows, documents, or any other client-related files</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(filesByProject || {}).map(([projectKey, projectFiles]) => {
              const project = projects?.find(p => p.id === projectKey);
              const isGeneral = projectKey === 'general';
              
              return (
                <div key={projectKey} className="space-y-2">
                  <div className="flex items-center gap-2 px-2">
                    {isGeneral ? (
                      <Badge variant="outline" className="text-xs">
                        General Files
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {project?.name || 'Unknown Project'}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      ({projectFiles?.length} {projectFiles?.length === 1 ? 'file' : 'files'})
                    </span>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectFiles?.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="flex items-center gap-2">
                            {getFileIcon(file.file_type)}
                            <span className="font-medium">{file.file_name}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {file.file_type || 'Unknown'}
                            </span>
                          </TableCell>
                          <TableCell>{formatFileSize(file.file_size)}</TableCell>
                          <TableCell>
                            {new Date(file.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewFile(file)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(file)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {currentFile && (
        <FileViewerDialog
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          fileUrl={currentFile.url}
          fileName={currentFile.name}
          fileType={currentFile.type}
        />
      )}
    </Card>
  );
};
