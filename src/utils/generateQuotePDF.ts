import html2pdf from 'html2pdf.js';

export interface PDFOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  imageQuality?: number;
  scale?: number;
}

/**
 * Generate a professional PDF from an HTML element using html2pdf.js
 * This ensures perfect WYSIWYG - what you see in preview is what you get in PDF
 */
export const generateQuotePDF = async (
  element: HTMLElement,
  options: PDFOptions = {}
): Promise<void> => {
  const {
    filename = 'quote.pdf',
    margin = 10,
    imageQuality = 0.98,
    scale = 2,
  } = options;

  const pdfOptions = {
    margin: 0,
    filename,
    image: { 
      type: 'jpeg' as const, 
      quality: imageQuality 
    },
    html2canvas: {
      scale,
      useCORS: true,
      logging: false,
      letterRendering: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: element.offsetWidth,
      height: element.offsetHeight,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait' as const,
      compress: true,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['.avoid-page-break', 'tr', 'table', '.products-table', 'img']
    },
  };

  try {
    await html2pdf().from(element).set(pdfOptions).save();
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

/**
 * Generate a PDF blob for email attachment or preview
 */
export const generateQuotePDFBlob = async (
  element: HTMLElement,
  options: Omit<PDFOptions, 'filename'> = {}
): Promise<Blob> => {
  const {
    margin = 10,
    imageQuality = 0.98,
    scale = 2,
  } = options;

  const pdfOptions = {
    margin: 0,
    image: { 
      type: 'jpeg' as const, 
      quality: imageQuality 
    },
    html2canvas: {
      scale,
      useCORS: true,
      logging: false,
      letterRendering: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: element.offsetWidth,
      height: element.offsetHeight,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait' as const,
      compress: true,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['.avoid-page-break', 'tr', 'table', 'img']
    },
  };

  try {
    const pdf = await html2pdf().from(element).set(pdfOptions).output('blob');
    return pdf;
  } catch (error) {
    console.error('PDF blob generation error:', error);
    throw new Error('Failed to generate PDF blob. Please try again.');
  }
};
