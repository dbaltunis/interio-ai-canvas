import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUploadFile } from "@/hooks/useFileStorage";

interface EnhancedImageUploadProps {
  projectId?: string;
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  showPreview?: boolean;
}

interface FileWithPreview {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const EnhancedImageUpload = ({
  projectId,
  onUploadComplete,
  maxFiles = 10,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  showPreview = true
}: EnhancedImageUploadProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useUploadFile();

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`;
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `File too large. Max size: ${maxSizeMB}MB`;
    }

    return null;
  };

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    
    // Check max files limit
    if (files.length + filesArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: FileWithPreview[] = [];

    filesArray.forEach(file => {
      const error = validateFile(file);
      
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      
      newFiles.push({
        file,
        preview,
        progress: 0,
        status: 'pending',
      });
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, maxFiles, acceptedFormats, maxSizeMB]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [processFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL to avoid memory leak
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadSingleFile = async (fileWithPreview: FileWithPreview, index: number) => {
    try {
      // Update status to uploading
      setFiles(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: 'uploading', progress: 0 };
        return updated;
      });

      // Simulate progress (in real app, you'd track actual upload progress)
      const progressInterval = setInterval(() => {
        setFiles(prev => {
          const updated = [...prev];
          if (updated[index]?.progress < 90) {
            updated[index] = { 
              ...updated[index], 
              progress: updated[index].progress + 10 
            };
          }
          return updated;
        });
      }, 100);

      const bucketName = 'business-assets';
      await uploadFile.mutateAsync({ 
        file: fileWithPreview.file, 
        projectId: projectId || 'general',
        bucketName 
      });

      clearInterval(progressInterval);

      // Update to success
      setFiles(prev => {
        const updated = [...prev];
        updated[index] = { 
          ...updated[index], 
          status: 'success', 
          progress: 100 
        };
        return updated;
      });

      return true;
    } catch (error: any) {
      // Update to error
      setFiles(prev => {
        const updated = [...prev];
        updated[index] = { 
          ...updated[index], 
          status: 'error', 
          error: error.message || 'Upload failed' 
        };
        return updated;
      });
      return false;
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      toast.info('No files to upload');
      return;
    }

    toast.info(`Uploading ${pendingFiles.length} file(s)...`);

    const uploadPromises = files.map((fileWithPreview, index) => {
      if (fileWithPreview.status === 'pending') {
        return uploadSingleFile(fileWithPreview, index);
      }
      return Promise.resolve(false);
    });

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter(Boolean).length;

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s)`);
      
      if (onUploadComplete) {
        const urls = files
          .filter(f => f.status === 'success')
          .map(f => f.preview);
        onUploadComplete(urls);
      }
    }
  };

  const clearCompleted = () => {
    setFiles(prev => {
      const remaining = prev.filter(f => f.status !== 'success');
      // Revoke URLs for removed files
      prev.forEach(f => {
        if (f.status === 'success') {
          URL.revokeObjectURL(f.preview);
        }
      });
      return remaining;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: FileWithPreview['status']) => {
    switch (status) {
      case 'success': return 'text-success';
      case 'error': return 'text-destructive';
      case 'uploading': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: FileWithPreview['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'uploading': return <Upload className="h-4 w-4 animate-pulse" />;
      default: return <ImageIcon className="h-4 w-4" />;
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Images
        </CardTitle>
        <CardDescription>
          Drag & drop images or click to browse. Max {maxFiles} files, {maxSizeMB}MB each
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
            "hover:border-primary hover:bg-primary/5",
            isDragging ? "border-primary bg-primary/10" : "border-border"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Upload className={cn(
            "mx-auto h-12 w-12 mb-4 transition-colors",
            isDragging ? "text-primary" : "text-muted-foreground"
          )} />
          
          <p className="text-base font-medium mb-1">
            {isDragging ? "Drop files here" : "Drag & drop images here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse files
          </p>
        </div>

        {/* Files Preview */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
              {files.some(f => f.status === 'success') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCompleted}
                  className="h-8 text-xs"
                >
                  Clear Completed
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {files.map((fileWithPreview, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card animate-scale-in"
                >
                  {/* Preview Thumbnail */}
                  {showPreview && (
                    <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-muted">
                      <img
                        src={fileWithPreview.preview}
                        alt={fileWithPreview.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {fileWithPreview.file.name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(fileWithPreview.file.size)}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    {fileWithPreview.status === 'uploading' && (
                      <Progress value={fileWithPreview.progress} className="h-1" />
                    )}

                    {/* Status */}
                    <div className={cn("flex items-center gap-1 text-xs", getStatusColor(fileWithPreview.status))}>
                      {getStatusIcon(fileWithPreview.status)}
                      <span className="capitalize">
                        {fileWithPreview.status === 'uploading' 
                          ? `Uploading ${fileWithPreview.progress}%`
                          : fileWithPreview.status}
                      </span>
                      {fileWithPreview.error && (
                        <span className="text-destructive">- {fileWithPreview.error}</span>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={fileWithPreview.status === 'uploading'}
                    className="flex-shrink-0 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUploadAll}
              disabled={files.every(f => f.status !== 'pending') || uploadFile.isPending}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadFile.isPending ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} File(s)`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
