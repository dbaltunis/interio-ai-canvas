import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Image as ImageIcon } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";
import { generateQuotePDFBlob } from "@/utils/generateQuotePDF";
import { PrintableQuote } from "@/components/jobs/quotation/PrintableQuote";

interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  image_url?: string;
  room_name?: string;
  children?: QuoteItem[];
  hasChildren?: boolean;
  isChild?: boolean;
  unit?: string;
}

interface QuotePreviewProps {
  quote: any;
  items: QuoteItem[];
  projectData?: any;
  showImages?: boolean;
  onToggleImages?: () => void;
}

export const QuotePreview = ({ 
  quote, 
  items, 
  projectData,
  showImages = true,
  onToggleImages 
}: QuotePreviewProps) => {
  const { toast } = useToast();
  const quoteRef = React.useRef<HTMLDivElement>(null);
  
  const handleDownloadPDF = async () => {
    if (!quoteRef.current) {
      toast({
        title: "Error",
        description: "Quote preview not ready. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait..."
      });

      const pdfBlob = await generateQuotePDFBlob(quoteRef.current);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${quote.quote_number || 'quote'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Downloaded",
        description: "Your quote has been downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Group items by room for better presentation
  const itemsByRoom = items.reduce((acc, item) => {
    if (item.isChild) return acc; // Skip children in room grouping
    
    const roomName = item.room_name || 'Unassigned';
    if (!acc[roomName]) {
      acc[roomName] = [];
    }
    acc[roomName].push(item);
    return acc;
  }, {} as Record<string, QuoteItem[]>);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quote Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                {quote.quote_number || `Quote #${quote.id.slice(0, 8)}`}
              </CardTitle>
              {quote.notes && (
                <p className="text-sm text-muted-foreground">{quote.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(quote.status)}>
                {quote.status || 'Draft'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleImages}
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                {showImages ? 'Hide' : 'Show'} Images
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {new Date(quote.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valid Until</p>
              <p className="font-medium">
                {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'No expiry'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="font-medium">{formatCurrency(quote.subtotal || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-semibold text-lg text-primary">
                {formatCurrency(quote.total_amount || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Itemized Quote Details - Grouped by Room */}
      {Object.entries(itemsByRoom).map(([roomName, roomItems]) => (
        <Card key={roomName}>
          <CardHeader>
            <CardTitle className="text-base">{roomName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomItems.map((item) => (
              <div key={item.id} className="space-y-3">
                {/* Main Item */}
                <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
                  {showImages && item.image_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-md border"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-lg">
                          {formatCurrency(item.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Child Items (Detailed Breakdown) */}
                {item.hasChildren && item.children && item.children.length > 0 && (
                  <div className="ml-8 space-y-2 border-l-2 pl-4">
                    {item.children.map((child) => (
                      <div key={child.id} className="flex items-start gap-4">
                        {showImages && child.image_url && (
                          <img
                            src={child.image_url}
                            alt={child.name}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium">{child.name}</span>
                              {child.description && child.description !== '-' && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  - {child.description}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm">
                                {child.quantity > 0 && (
                                  <span className="text-muted-foreground">
                                    {child.quantity.toFixed(2)}{child.unit} × {formatCurrency(child.unit_price)} ={' '}
                                  </span>
                                )}
                                <span className="font-medium">
                                  {formatCurrency(child.total)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {item !== roomItems[roomItems.length - 1] && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Quote Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(quote.subtotal || 0)}</span>
            </div>
            {quote.tax_amount && quote.tax_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Tax ({(quote.tax_rate * 100).toFixed(1)}%)
                </span>
                <span className="font-medium">{formatCurrency(quote.tax_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(quote.total_amount || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden quote template for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <PrintableQuote
          ref={quoteRef}
          blocks={projectData?.blocks || []}
          projectData={{ ...projectData, items }}
          isPrintMode={true}
          showDetailedBreakdown={true}
          showImages={showImages}
        />
      </div>
    </div>
  );
};
