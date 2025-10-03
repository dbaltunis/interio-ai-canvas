import React from "react";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";

interface PrintableQuoteProps {
  blocks: any[];
  projectData: any;
}

export const PrintableQuote = React.forwardRef<HTMLDivElement, PrintableQuoteProps>(
  ({ blocks, projectData }, ref) => {
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
          padding: '20mm',
          boxSizing: 'border-box',
        }}
      >
        <LivePreview 
          blocks={blocks} 
          projectData={projectData}
          isEditable={false}
        />
      </div>
    );
  }
);

PrintableQuote.displayName = 'PrintableQuote';
