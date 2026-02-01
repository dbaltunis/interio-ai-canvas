import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, ExternalLink } from "lucide-react";

interface FileViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export const FileViewerDialog = ({ open, onOpenChange, fileUrl, fileName, fileType }: FileViewerDialogProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const isImage = fileType.startsWith('image/');
  const isPdf = fileType.includes('pdf');
  
  // Reset states when dialog opens with new file
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setIsLoading(true);
      setHasError(false);
    }
    onOpenChange(newOpen);
  };
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    link.click();
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Add #view=FitH to PDF URL for better rendering
  const pdfUrl = isPdf ? `${fileUrl}#view=FitH` : fileUrl;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate flex-1">{fileName}</DialogTitle>
            <div className="flex items-center gap-2">
              {isPdf && (
                <Button variant="outline" size="icon" onClick={handleOpenInNewTab} title="Open in new tab">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={handleDownload} title="Download">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto relative min-h-[300px]">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Loading {isPdf ? 'PDF' : 'file'}...</p>
            </div>
          )}
          
          {/* Error state */}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
              <p className="text-sm text-muted-foreground mb-4">Failed to load file preview</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleOpenInNewTab}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
          
          {isImage ? (
            <div className="flex items-center justify-center p-4">
              <img 
                src={fileUrl} 
                alt={fileName}
                className="max-w-full max-h-[70vh] object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          ) : isPdf ? (
            <div className="relative w-full h-[70vh]">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={fileName}
                onLoad={handleIframeLoad}
              />
              {/* Fallback message if iframe doesn't render PDF */}
              {!isLoading && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 shadow-sm">
                  <p className="text-xs text-muted-foreground">
                    PDF not displaying? 
                    <Button variant="link" size="sm" className="px-1 h-auto" onClick={handleOpenInNewTab}>
                      Open in new tab
                    </Button>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="text-muted-foreground mb-4">
                <p className="text-lg font-medium mb-2">Preview not available</p>
                <p className="text-sm">This file type cannot be previewed in the browser.</p>
                <p className="text-xs mt-2">File type: {fileType || 'Unknown'}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={handleOpenInNewTab}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
