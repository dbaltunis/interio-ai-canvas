import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generateQuotePDFBlob(element: HTMLElement): Promise<Blob> {
  console.log('Generating PDF from element:', element);
  
  try {
    // Wait for all images to load
    const images = element.getElementsByTagName('img');
    await Promise.all(
      Array.from(images).map(img => {
        if (img.complete) return Promise.resolve<void>(undefined);
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => {
            console.warn('Image failed to load:', img.src);
            resolve(); // Continue even if image fails
          };
          setTimeout(() => resolve(), 3000); // Timeout after 3 seconds
        });
      })
    );

    // Capture the element as canvas with high quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
      onclone: (clonedDoc) => {
        // Ensure all images in the cloned document are visible
        const clonedImages = clonedDoc.getElementsByTagName('img');
        Array.from(clonedImages).forEach(img => {
          img.style.display = 'block';
        });
      },
      imageTimeout: 0, // Don't timeout on images
      ignoreElements: (element) => {
        // Ignore elements that might cause issues
        return element.tagName === 'IFRAME' || element.tagName === 'VIDEO';
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
    });

    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add new pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Return as Blob instead of downloading
    return pdf.output('blob');
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
