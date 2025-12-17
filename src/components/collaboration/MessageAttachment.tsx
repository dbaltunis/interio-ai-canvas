import { FileText, Download, Image as ImageIcon, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MessageAttachmentData {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
}

interface MessageAttachmentProps {
  attachment: MessageAttachmentData;
  isOwn?: boolean;
}

interface AttachmentPreviewProps {
  file: File;
  url: string;
  onRemove: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageType = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return FileText;
  if (isImageType(fileType)) return ImageIcon;
  return File;
};

export const MessageAttachment = ({ attachment, isOwn = false }: MessageAttachmentProps) => {
  const FileIcon = getFileIcon(attachment.file_type);
  
  if (isImageType(attachment.file_type)) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden max-w-[280px]">
        <a 
          href={attachment.file_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <img 
            src={attachment.file_url} 
            alt={attachment.file_name}
            className="w-full h-auto rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            loading="lazy"
          />
        </a>
        <div className={`flex items-center gap-2 mt-1 text-[10px] ${
          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
        }`}>
          <span className="truncate max-w-[200px]">{attachment.file_name}</span>
          <span>•</span>
          <span>{formatFileSize(attachment.file_size)}</span>
        </div>
      </div>
    );
  }

  return (
    <a 
      href={attachment.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 mt-2 p-3 rounded-lg transition-colors ${
        isOwn 
          ? 'bg-primary-foreground/10 hover:bg-primary-foreground/20' 
          : 'bg-muted/50 hover:bg-muted'
      }`}
    >
      <div className={`p-2 rounded-lg ${isOwn ? 'bg-primary-foreground/20' : 'bg-background'}`}>
        <FileIcon className={`h-5 w-5 ${isOwn ? 'text-primary-foreground' : 'text-primary'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          isOwn ? 'text-primary-foreground' : 'text-foreground'
        }`}>
          {attachment.file_name}
        </p>
        <p className={`text-[10px] ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {formatFileSize(attachment.file_size)}
        </p>
      </div>
      <Download className={`h-4 w-4 shrink-0 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`} />
    </a>
  );
};

export const AttachmentPreview = ({ file, url, onRemove }: AttachmentPreviewProps) => {
  const isImage = isImageType(file.type);
  const FileIcon = getFileIcon(file.type);

  return (
    <div className="relative group">
      {isImage ? (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
          <img 
            src={url} 
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
          <FileIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs truncate max-w-[100px]">{file.name}</span>
        </div>
      )}
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
