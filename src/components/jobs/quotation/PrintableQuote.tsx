import React from "react";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";

interface PrintableQuoteProps {
  blocks: any[];
  projectData: any;
  isPrintMode?: boolean;
}

export const PrintableQuote = React.forwardRef<HTMLDivElement, PrintableQuoteProps>(
  ({ blocks, projectData, isPrintMode = true }, ref) => {
    return (
      <div 
        ref={ref}
        className="bg-white text-black"
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#000000',
          backgroundColor: '#ffffff',
          width: '210mm',
          minHeight: '297mm',
          padding: '15mm',
          boxSizing: 'border-box',
        }}
      >
        <LivePreview 
          blocks={blocks} 
          projectData={projectData}
          isEditable={false}
          isPrintMode={isPrintMode}
        />
      </div>
    );
  }
);

PrintableQuote.displayName = 'PrintableQuote';
