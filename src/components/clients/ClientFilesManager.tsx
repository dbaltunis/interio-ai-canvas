import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, File, Image, FileText, Download, Trash2, Eye } from "lucide-react";
import { useClientFiles, useUploadClientFile, useDeleteClientFile, useGetClientFileUrl } from "@/hooks/useClientFiles";
import { toast } from "sonner";
import { FileViewerDialog } from "./FileViewerDialog";

interface ClientFilesManagerProps {
  clientId: string;
  userId: string;
}

export const ClientFilesManager = ({ clientId, userId }: ClientFilesManagerProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<{ url: string; name: string; type: string } | null>(null);

  const { data: files, isLoading } = useClientFiles(clientId, userId);
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
        });
      }
      setSelectedFiles(null);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Client Files & Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="flex-1"
          />
          <Button
            onClick={handleUpload}
            disabled={!selectedFiles || uploadFile.isPending}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadFile.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </div>

        {/* Files List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading files...
          </div>
        ) : !files || files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <File className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No files uploaded yet</p>
            <p className="text-sm mt-1">Upload photos of windows, documents, or any other client-related files</p>
          </div>
        ) : (
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
              {files.map((file) => (
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
