import { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import html2pdf from 'html2pdf.js';
import { generateProductTableHTML } from '@/utils/quoteDataBinding';

interface QuotePDFExporterProps {
  canvasJSON: any;
  quoteData: any;
  onExportComplete?: () => void;
  filename?: string;
}

/**
 * Hidden component that renders canvas to DOM and exports to PDF
 */
export const QuotePDFExporter = ({ 
  canvasJSON, 
  quoteData, 
  onExportComplete,
  filename = 'quote.pdf'
}: QuotePDFExporterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const exportToPDF = async () => {
      if (!canvasRef.current || !containerRef.current) return;

      try {
        // Create temporary fabric canvas
        const tempCanvas = new FabricCanvas(canvasRef.current, {
          width: 794,
          height: 1123,
          backgroundColor: '#ffffff',
        });

        // Load canvas JSON
        await new Promise((resolve) => {
          tempCanvas.loadFromJSON(canvasJSON, () => {
            tempCanvas.renderAll();
            resolve(true);
          });
        });

        // Convert canvas to data URL
        const canvasDataURL = tempCanvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2,
        });

        // Create HTML container with canvas image and product table
        const htmlContent = `
          <div style="width: 794px; padding: 40px; font-family: Arial, sans-serif;">
            <img src="${canvasDataURL}" style="width: 100%; height: auto; margin-bottom: 30px;" />
            ${quoteData.items ? `
              <div style="margin-top: 40px;">
                <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #1f2937;">Line Items</h2>
                ${generateProductTableHTML(quoteData.items, quoteData.subtotal, quoteData.taxAmount, quoteData.total)}
              </div>
            ` : ''}
          </div>
        `;

        // Create temporary container for PDF generation
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = htmlContent;
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);

        // Generate PDF
        const opt = {
          margin: 0,
          filename: filename,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        };

        await html2pdf().set(opt).from(tempContainer).save();

        // Cleanup
        document.body.removeChild(tempContainer);
        tempCanvas.dispose();

        if (onExportComplete) {
          onExportComplete();
        }
      } catch (error) {
        console.error('PDF export error:', error);
      }
    };

    exportToPDF();
  }, [canvasJSON, quoteData, filename, onExportComplete]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
