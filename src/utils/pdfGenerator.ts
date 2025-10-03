import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generateQuotePDFBlob(element: HTMLElement): Promise<Blob> {
  console.log('Generating PDF from element:', element);
  
  try {
    // Capture the element as canvas with high quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true, // Allow cross-origin images
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
      removeContainer: false,
      imageTimeout: 15000, // Wait for images to load
      ignoreElements: (el) => {
        // Ignore script, style elements and elements with no-print class
        return el.tagName === 'SCRIPT' || 
               el.tagName === 'STYLE' || 
               el.tagName === 'IFRAME' ||
               el.classList.contains('no-print');
      }
    });

    console.log('Canvas created:', { width: canvas.width, height: canvas.height });

    // Calculate PDF dimensions (A4 in mm)
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG instead of PNG
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Add new pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    // Return as Blob instead of downloading
    return pdf.output('blob');
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
