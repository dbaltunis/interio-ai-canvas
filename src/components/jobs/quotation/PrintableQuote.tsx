import React from "react";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";

interface PrintableQuoteProps {
  blocks: any[];
  projectData: any;
  isPrintMode?: boolean;
  showDetailedBreakdown?: boolean;
  showImages?: boolean;
}

export const PrintableQuote = React.forwardRef<HTMLDivElement, PrintableQuoteProps>(
  ({ blocks, projectData, isPrintMode = true, showDetailedBreakdown, showImages }, ref) => {
    // Extract document settings from blocks
    const documentSettings = blocks?.find((b: any) => b.type === 'document-settings')?.content || {};
    const orientation = documentSettings.orientation || 'portrait';
    const marginTop = documentSettings.marginTop || 8;
    const marginRight = documentSettings.marginRight || 8;
    const marginBottom = documentSettings.marginBottom || 6;
    const marginLeft = documentSettings.marginLeft || 8;
    
    return (
      <div 
        ref={ref}
        className="bg-white text-black"
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '10pt',
          lineHeight: '1.4',
          color: '#000000',
          backgroundColor: '#ffffff',
          width: orientation === 'landscape' ? '297mm' : '210mm',
          minHeight: orientation === 'landscape' ? '210mm' : '297mm',
          padding: `${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm`,
          margin: '0',
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <LivePreview 
          blocks={blocks} 
          projectData={projectData}
          isEditable={false}
          isPrintMode={isPrintMode}
          showDetailedBreakdown={showDetailedBreakdown !== undefined ? showDetailedBreakdown : true}
          showImages={showImages !== undefined ? showImages : true}
        />
      </div>
    );
  }
);

PrintableQuote.displayName = 'PrintableQuote';
