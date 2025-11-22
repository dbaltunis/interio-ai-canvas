import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface FileViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export const FileViewerDialog = ({ open, onOpenChange, fileUrl, fileName, fileType }: FileViewerDialogProps) => {
  const isImage = fileType.startsWith('image/');
  const isPdf = fileType.includes('pdf');
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate flex-1">{fileName}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {isImage ? (
            <div className="flex items-center justify-center p-4">
              <img 
                src={fileUrl} 
                alt={fileName}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              className="w-full h-[70vh] border-0"
              title={fileName}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="text-muted-foreground mb-4">
                <p className="text-lg font-medium mb-2">Preview not available</p>
                <p className="text-sm">This file type cannot be previewed in the browser.</p>
                <p className="text-xs mt-2">File type: {fileType || 'Unknown'}</p>
              </div>
              <Button onClick={handleDownload} className="mt-4">
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
