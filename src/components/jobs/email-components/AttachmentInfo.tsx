import { FileText, Image, File, Table } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AttachmentData {
  filename: string;
  type: string;
  size: number;
}

interface AttachmentInfoProps {
  attachments: AttachmentData[];
  className?: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="h-3 w-3" />;
  if (type.includes('pdf')) return <FileText className="h-3 w-3" />;
  if (type.includes('spreadsheet') || type.includes('csv') || type.includes('excel')) return <Table className="h-3 w-3" />;
  return <File className="h-3 w-3" />;
};

const getFileTypeColor = (type: string) => {
  if (type.startsWith('image/')) return 'bg-green-100 text-green-800';
  if (type.includes('pdf')) return 'bg-red-100 text-red-800';
  if (type.includes('spreadsheet') || type.includes('csv') || type.includes('excel')) return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-800';
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const AttachmentInfo = ({ attachments, className = "" }: AttachmentInfoProps) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  // Group by file type for compact display
  const typeGroups = attachments.reduce((acc, att) => {
    const baseType = att.type.split('/')[0];
    const key = baseType === 'image' ? 'images' : 
                baseType === 'application' && att.type.includes('pdf') ? 'pdfs' :
                baseType === 'text' || att.type.includes('spreadsheet') || att.type.includes('excel') ? 'docs' : 'files';
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(att);
    return acc;
  }, {} as Record<string, AttachmentData[]>);

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {Object.entries(typeGroups).map(([type, files]) => (
        <Badge 
          key={type} 
          variant="secondary" 
          className={`text-xs px-2 py-1 flex items-center gap-1 ${getFileTypeColor(files[0].type)}`}
        >
          {getFileIcon(files[0].type)}
          <span>{files.length} {type}</span>
        </Badge>
      ))}
    </div>
  );
};