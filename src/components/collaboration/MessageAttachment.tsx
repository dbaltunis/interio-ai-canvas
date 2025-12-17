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
      <div className="mt-1.5 rounded-lg overflow-hidden max-w-[220px]">
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
        <p className={`text-[10px] mt-1 truncate ${
          isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
        }`}>
          {attachment.file_name}
        </p>
      </div>
    );
  }

  return (
    <a 
      href={attachment.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 mt-1.5 p-2 rounded-lg transition-colors ${
        isOwn 
          ? 'bg-primary-foreground/10 hover:bg-primary-foreground/20' 
          : 'bg-muted hover:bg-muted/80'
      }`}
    >
      <div className={`p-1.5 rounded ${isOwn ? 'bg-primary-foreground/20' : 'bg-background'}`}>
        <FileIcon className={`h-4 w-4 ${isOwn ? 'text-primary-foreground' : 'text-primary'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${
          isOwn ? 'text-primary-foreground' : 'text-foreground'
        }`}>
          {attachment.file_name}
        </p>
        <p className={`text-[10px] ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
          {formatFileSize(attachment.file_size)}
        </p>
      </div>
      <Download className={`h-3.5 w-3.5 shrink-0 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`} />
    </a>
  );
};

export const AttachmentPreview = ({ file, url, onRemove }: AttachmentPreviewProps) => {
  const isImage = isImageType(file.type);
  const FileIcon = getFileIcon(file.type);

  return (
    <div className="relative group">
      {isImage ? (
        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-border bg-muted">
          <img 
            src={url} 
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted border border-border">
          <FileIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs truncate max-w-[80px]">{file.name}</span>
        </div>
      )}
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity p-0"
        onClick={onRemove}
      >
        <X className="h-2.5 w-2.5" />
      </Button>
    </div>
  );
};
