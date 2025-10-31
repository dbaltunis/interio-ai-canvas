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
          width: '210mm',
          minHeight: '297mm',
          padding: '12mm 10mm 8mm 8mm',
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
