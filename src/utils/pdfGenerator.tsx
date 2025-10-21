import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generate PDF from HTML element - "What You See Is What You Get"
 * This converts the actual screen view to PDF, ensuring consistency
 */
export async function generateQuotePDFFromElement(
  element: HTMLElement,
  filename: string = 'quote.pdf'
): Promise<Blob> {
  console.log('🎯 PDF Generation - Converting screen view to PDF');
  
  try {
    // Capture the element as canvas with high quality
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true, // Allow cross-origin images
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });
    
    // Calculate PDF dimensions (A4 size)
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > 297 ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Add image to PDF
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297;
    
    // Add new pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }
    
    // Convert to blob
    const blob = pdf.output('blob');
    console.log('✅ PDF Blob generated:', blob.size, 'bytes');
    return blob;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
