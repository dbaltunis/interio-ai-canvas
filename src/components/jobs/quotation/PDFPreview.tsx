import React, { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { QuotePDFDocument } from './pdf/QuotePDFDocument';
import { Loader2 } from 'lucide-react';

interface PDFPreviewProps {
  blocks: any[];
  projectData: any;
  showDetailedBreakdown?: boolean;
  showImages?: boolean;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  blocks,
  projectData,
  showDetailedBreakdown = false,
  showImages = false,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const generatePDF = async () => {
      try {
        setIsGenerating(true);
        setError(null);

        // Generate PDF blob using @react-pdf/renderer
        const pdfBlob = await pdf(
          <QuotePDFDocument
            blocks={blocks}
            projectData={projectData}
            showDetailedBreakdown={showDetailedBreakdown}
            showImages={showImages}
          />
        ).toBlob();

        // Create object URL for the blob
        objectUrl = URL.createObjectURL(pdfBlob);

        if (isMounted) {
          setPdfUrl(objectUrl);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('Error generating PDF preview:', err);
        if (isMounted) {
          setError('Failed to generate PDF preview');
          setIsGenerating(false);
        }
      }
    };

    generatePDF();

    // Cleanup function
    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [blocks, projectData, showDetailedBreakdown, showImages]);

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/10 rounded-lg">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Generating PDF preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-destructive/10 rounded-lg">
        <div className="text-center space-y-2">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground">Please try again or check your data</p>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/10 rounded-lg">
        <p className="text-sm text-muted-foreground">No PDF available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full border rounded-lg overflow-hidden bg-muted/5">
      <iframe
        src={pdfUrl}
        className="w-full h-[600px]"
        title="Quote PDF Preview"
        style={{ border: 'none' }}
      />
    </div>
  );
};
