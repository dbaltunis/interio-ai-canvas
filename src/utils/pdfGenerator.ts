import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generateQuotePDFBlob(element: HTMLElement): Promise<Blob> {
  console.log('Generating PDF from element:', element);
  
  // Capture the element as canvas with high quality
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: 794, // A4 width in pixels at 96 DPI (210mm)
    windowWidth: 794,
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
}
