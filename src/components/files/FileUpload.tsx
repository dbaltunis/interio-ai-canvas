
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, File, Image, Trash2, Download, Eye } from "lucide-react";
import { useProjectFiles, useUploadFile, useDeleteFile, useGetFileUrl } from "@/hooks/useFileStorage";

interface FileUploadProps {
  projectId: string;
}

export const FileUpload = ({ projectId }: FileUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: files, isLoading } = useProjectFiles(projectId);
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();
  const getFileUrl = useGetFileUrl();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles) return;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const isImage = file.type.startsWith('image/');
      const bucketName = isImage ? 'project-images' : 'project-documents';
      
      await uploadFile.mutateAsync({ file, projectId, bucketName });
    }

    setSelectedFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (file: any) => {
    deleteFile.mutate(file);
  };

  const handleViewFile = async (file: any) => {
    try {
      const url = await getFileUrl.mutateAsync({
        bucketName: file.bucket_name,
        filePath: file.file_path
      });
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to get file URL:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div>Loading files...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload Files
          </CardTitle>
          <CardDescription>
            Upload documents and images for this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Select Files</Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
            />
          </div>
          
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files:</Label>
              {Array.from(selectedFiles).map((file, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {getFileIcon(file.type)}
                  <span className="text-sm">{file.name}</span>
                  <Badge variant="outline">{formatFileSize(file.size)}</Badge>
                </div>
              ))}
            </div>
          )}
          
          <Button 
            onClick={handleUpload}
            disabled={!selectedFiles || selectedFiles.length === 0 || uploadFile.isPending}
          >
            {uploadFile.isPending ? 'Uploading...' : 'Upload Files'}
          </Button>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Project Files</CardTitle>
          <CardDescription>Manage uploaded documents and images</CardDescription>
        </CardHeader>
        <CardContent>
          {!files || files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <File className="mx-auto h-12 w-12 mb-4" />
              <p>No files uploaded yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file.file_type)}
                        <span className="font-medium">{file.file_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {file.bucket_name === 'project-images' ? 'Image' : 'Document'}
                      </Badge>
                    </TableCell>
                    <TableCell>{file.file_size ? formatFileSize(file.file_size) : 'Unknown'}</TableCell>
                    <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewFile(file)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file)}
                          disabled={deleteFile.isPending}
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
      </Card>
    </div>
  );
};
