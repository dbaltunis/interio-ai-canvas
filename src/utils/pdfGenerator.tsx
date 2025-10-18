import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { QuotePDFDocument } from '@/components/jobs/quotation/pdf/QuotePDFDocument';

export async function generateQuotePDFBlob(blocks: any[], projectData: any): Promise<Blob> {
  console.log('🎯 PDF Generation - Full Data:', {
    blocks: blocks.length,
    items: projectData.items?.length || 0,
    itemSample: projectData.items?.[0],
    subtotal: projectData.subtotal,
    total: projectData.total,
    currency: projectData.currency
  });
  
  try {
    // Create PDF document component
    const MyDoc = () => <QuotePDFDocument blocks={blocks} projectData={projectData} />;
    
    // Generate PDF blob
    const blob = await pdf(<MyDoc />).toBlob();
    
    console.log('✅ PDF Blob generated:', blob.size, 'bytes');
    return blob;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
