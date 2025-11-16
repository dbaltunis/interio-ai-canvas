import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import { Badge } from '@/components/ui/badge';

interface QRCodeLabelGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Array<{
    id: string;
    name: string;
    sku?: string;
    quantity?: number;
    unit?: string;
    location?: string;
    category?: string;
  }>;
}

type LabelSize = 'small' | 'medium' | 'large';

const labelSizes = {
  small: { width: 50, height: 30, qrSize: 80 },
  medium: { width: 80, height: 50, qrSize: 120 },
  large: { width: 100, height: 70, qrSize: 160 },
};

export const QRCodeLabelGenerator = ({
  open,
  onOpenChange,
  items,
}: QRCodeLabelGeneratorProps) => {
  const [labelSize, setLabelSize] = useState<LabelSize>('medium');

  const generatePDF = () => {
    const size = labelSizes[labelSize];
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const margin = 10;
    const spacing = 5;
    let x = margin;
    let y = margin;
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm

    items.forEach((item, index) => {
      // Check if we need a new row or page
      if (x + size.width > pageWidth - margin) {
        x = margin;
        y += size.height + spacing;
      }

      if (y + size.height > pageHeight - margin) {
        pdf.addPage();
        x = margin;
        y = margin;
      }

      // Draw border
      pdf.rect(x, y, size.width, size.height);

      // Get QR code as data URL
      const qrElement = document.getElementById(`label-qr-${item.id}`);
      if (qrElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(qrElement);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          canvas.width = size.qrSize;
          canvas.height = size.qrSize;
          ctx?.drawImage(img, 0, 0, size.qrSize, size.qrSize);
          const imgData = canvas.toDataURL('image/png');
          
          // Add QR code
          const qrMm = size.width * 0.5;
          pdf.addImage(imgData, 'PNG', x + (size.width - qrMm) / 2, y + 3, qrMm, qrMm);
          
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }

      // Add text
      const textY = y + size.width * 0.5 + 5;
      pdf.setFontSize(labelSize === 'small' ? 6 : labelSize === 'medium' ? 8 : 10);
      pdf.setFont('helvetica', 'bold');
      
      // Truncate name if too long
      const maxChars = labelSize === 'small' ? 15 : labelSize === 'medium' ? 25 : 35;
      const displayName = item.name.length > maxChars 
        ? item.name.substring(0, maxChars) + '...' 
        : item.name;
      
      pdf.text(displayName, x + size.width / 2, textY, { align: 'center' });

      if (labelSize !== 'small') {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(labelSize === 'medium' ? 6 : 7);
        
        let infoY = textY + 3;
        if (item.sku) {
          pdf.text(`SKU: ${item.sku}`, x + size.width / 2, infoY, { align: 'center' });
          infoY += 3;
        }
        if (item.quantity !== undefined) {
          pdf.text(`Qty: ${item.quantity} ${item.unit || ''}`, x + size.width / 2, infoY, { align: 'center' });
          infoY += 3;
        }
        if (item.location && labelSize === 'large') {
          pdf.text(`Loc: ${item.location}`, x + size.width / 2, infoY, { align: 'center' });
        }
      }

      x += size.width + spacing;
    });

    pdf.save(`inventory-labels-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const size = labelSizes[labelSize];
    const labelsHtml = items
      .map(
        (item) => `
      <div class="label" style="width: ${size.width}mm; height: ${size.height}mm;">
        <div class="qr-container">
          ${document.getElementById(`label-qr-${item.id}`)?.outerHTML || ''}
        </div>
        <div class="info">
          <div class="name">${item.name}</div>
          ${item.sku ? `<div class="detail">SKU: ${item.sku}</div>` : ''}
          ${item.quantity !== undefined ? `<div class="detail">Qty: ${item.quantity} ${item.unit || ''}</div>` : ''}
          ${item.location && labelSize !== 'small' ? `<div class="detail">Loc: ${item.location}</div>` : ''}
        </div>
      </div>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inventory Labels</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 10mm;
            }
            .labels-container {
              display: flex;
              flex-wrap: wrap;
              gap: 5mm;
            }
            .label {
              border: 1px solid #ccc;
              padding: 3mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              page-break-inside: avoid;
              background: white;
            }
            .qr-container svg {
              width: ${size.width * 0.5}mm !important;
              height: ${size.width * 0.5}mm !important;
            }
            .info {
              text-align: center;
              width: 100%;
              margin-top: 2mm;
            }
            .name {
              font-weight: 600;
              font-size: ${labelSize === 'small' ? '6pt' : labelSize === 'medium' ? '8pt' : '10pt'};
              margin-bottom: 1mm;
            }
            .detail {
              font-size: ${labelSize === 'small' ? '5pt' : labelSize === 'medium' ? '6pt' : '7pt'};
              color: #666;
              margin-top: 0.5mm;
            }
            @media print {
              body { padding: 0; }
              .label { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="labels-container">
            ${labelsHtml}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate QR Code Labels</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Label Size Selection */}
          <div className="space-y-3">
            <Label>Label Size</Label>
            <RadioGroup value={labelSize} onValueChange={(v) => setLabelSize(v as LabelSize)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="font-normal">
                  Small (50mm × 30mm) - Basic info only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="font-normal">
                  Medium (80mm × 50mm) - Recommended
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="font-normal">
                  Large (100mm × 70mm) - Full details
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <Label>Preview ({items.length} label{items.length !== 1 ? 's' : ''})</Label>
            <div className="border rounded-lg p-4 bg-muted max-h-[300px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="border rounded p-3 bg-background flex flex-col items-center gap-2"
                  >
                    <div className="hidden">
                      <QRCodeSVG
                        id={`label-qr-${item.id}`}
                        value={`inventory:${item.id}`}
                        size={labelSizes[labelSize].qrSize}
                        level="H"
                      />
                    </div>
                    <QRCodeSVG
                      value={`inventory:${item.id}`}
                      size={80}
                      level="H"
                    />
                    <div className="text-center w-full">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {item.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      )}
                      {item.quantity !== undefined && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {item.quantity} {item.unit}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {items.length > 4 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  + {items.length - 4} more label{items.length - 4 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={generatePDF} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
