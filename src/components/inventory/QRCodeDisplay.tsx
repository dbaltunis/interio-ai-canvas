import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

interface QRCodeDisplayProps {
  itemId: string;
  itemName?: string;
  size?: number;
  showActions?: boolean;
}

export const QRCodeDisplay = ({ 
  itemId, 
  itemName, 
  size = 200,
  showActions = true 
}: QRCodeDisplayProps) => {
  const qrValue = `inventory:${itemId}`;

  const handleDownload = () => {
    const svg = document.getElementById(`qr-${itemId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qr-${itemName || itemId}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${itemName || itemId}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .qr-container {
              text-align: center;
              page-break-inside: avoid;
            }
            .qr-code {
              margin: 20px 0;
            }
            .item-name {
              font-size: 18px;
              font-weight: 600;
              margin-top: 10px;
            }
            .item-id {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-code">${document.getElementById(`qr-${itemId}`)?.outerHTML}</div>
            ${itemName ? `<div class="item-name">${itemName}</div>` : ''}
            <div class="item-id">ID: ${itemId}</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-background border rounded-lg">
        <QRCodeSVG
          id={`qr-${itemId}`}
          value={qrValue}
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>
      
      {itemName && (
        <div className="text-center">
          <p className="font-medium text-foreground">{itemName}</p>
          <p className="text-sm text-muted-foreground">ID: {itemId}</p>
        </div>
      )}

      {showActions && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      )}
    </div>
  );
};
