import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generateQuotePDFBlob(element: HTMLElement): Promise<Blob> {
  console.log('Generating PDF from element:', element);
  
  try {
    // Remove all images temporarily to avoid PNG errors
    const images = Array.from(element.getElementsByTagName('img'));
    const imageData: Array<{ img: HTMLImageElement; src: string; parent: HTMLElement }> = [];
    
    images.forEach(img => {
      const parent = img.parentElement;
      if (parent) {
        imageData.push({ img, src: img.src, parent });
        // Replace image with placeholder
        const placeholder = document.createElement('div');
        placeholder.style.width = img.width + 'px';
        placeholder.style.height = img.height + 'px';
        placeholder.style.backgroundColor = '#f0f0f0';
        placeholder.style.display = 'inline-block';
        parent.replaceChild(placeholder, img);
      }
    });

    // Capture the element as canvas with high quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
      removeContainer: false,
      imageTimeout: 0,
      ignoreElements: (el) => {
        // Ignore script and style elements
        return el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'IFRAME';
      }
    });

    // Restore images
    imageData.forEach(({ img, parent }) => {
      const placeholders = parent.querySelectorAll('div[style*="background-color: rgb(240, 240, 240)"]');
      if (placeholders.length > 0) {
        parent.replaceChild(img, placeholders[0]);
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
