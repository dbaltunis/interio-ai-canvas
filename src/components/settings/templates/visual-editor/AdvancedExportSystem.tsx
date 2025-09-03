import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Download,
  FileImage,
  FileText,
  Share2,
  Mail,
  Cloud,
  Settings,
  Palette,
  Layout,
  Zap,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface AdvancedExportSystemProps {
  templateRef: React.RefObject<HTMLElement>;
  templateData: any;
  onExport?: (format: string, options: any) => void;
}

interface ExportOptions {
  format: 'pdf' | 'png' | 'jpg' | 'html' | 'docx';
  quality: number;
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Custom';
  orientation: 'portrait' | 'landscape';
  margins: number;
  includeSignatures: boolean;
  watermark: boolean;
  compression: 'high' | 'medium' | 'low';
  resolution: '72' | '150' | '300' | '600';
}

export const AdvancedExportSystem = ({
  templateRef,
  templateData,
  onExport
}: AdvancedExportSystemProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    quality: 95,
    pageSize: 'A4',
    orientation: 'portrait',
    margins: 10,
    includeSignatures: true,
    watermark: false,
    compression: 'medium',
    resolution: '150'
  });

  const updateExportOptions = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const exportToPDF = async () => {
    if (!templateRef.current) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Convert to canvas
      setExportProgress(25);
      const canvas = await html2canvas(templateRef.current, {
        scale: parseInt(exportOptions.resolution) / 72,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      setExportProgress(50);

      // Create PDF
      const pdf = new jsPDF({
        orientation: exportOptions.orientation,
        unit: 'mm',
        format: exportOptions.pageSize.toLowerCase() as any
      });

      const imgWidth = pdf.internal.pageSize.getWidth() - (exportOptions.margins * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      setExportProgress(75);

      pdf.addImage(
        canvas.toDataURL('image/jpeg', exportOptions.quality / 100),
        'JPEG',
        exportOptions.margins,
        exportOptions.margins,
        imgWidth,
        imgHeight
      );

      // Add watermark if enabled
      if (exportOptions.watermark) {
        pdf.setTextColor(200, 200, 200);
        pdf.setFontSize(50);
        pdf.text('DRAFT', pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() / 2, {
          angle: 45,
          align: 'center'
        });
      }

      setExportProgress(100);

      // Download
      pdf.save(`${templateData.name || 'document'}.pdf`);
      toast("PDF exported successfully!");

    } catch (error) {
      console.error('Export error:', error);
      toast("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToImage = async (format: 'png' | 'jpg') => {
    if (!templateRef.current) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      setExportProgress(50);
      
      const canvas = await html2canvas(templateRef.current, {
        scale: parseInt(exportOptions.resolution) / 72,
        useCORS: true,
        allowTaint: true,
        backgroundColor: format === 'jpg' ? '#ffffff' : null
      });

      setExportProgress(75);

      const link = document.createElement('a');
      link.download = `${templateData.name || 'document'}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, exportOptions.quality / 100);
      
      setExportProgress(100);
      link.click();
      
      toast(`${format.toUpperCase()} exported successfully!`);

    } catch (error) {
      console.error('Export error:', error);
      toast("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToHTML = () => {
    if (!templateRef.current) return;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${templateData.name || 'Document'}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; }
        .template-container { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="template-container">
        ${templateRef.current.innerHTML}
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateData.name || 'document'}.html`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast("HTML exported successfully!");
  };

  const handleExport = async () => {
    onExport?.(exportOptions.format, exportOptions);

    switch (exportOptions.format) {
      case 'pdf':
        await exportToPDF();
        break;
      case 'png':
      case 'jpg':
        await exportToImage(exportOptions.format);
        break;
      case 'html':
        exportToHTML();
        break;
      case 'docx':
        toast("DOCX export coming soon!");
        break;
    }
  };

  const shareDocument = () => {
    if (navigator.share) {
      navigator.share({
        title: templateData.name || 'Document',
        text: 'Check out this document template',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard!");
    }
  };

  const emailDocument = () => {
    const subject = encodeURIComponent(`Document: ${templateData.name || 'Template'}`);
    const body = encodeURIComponent(`Please find the document template at: ${window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Advanced Export System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Exporting...</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="h-2" />
          </div>
        )}

        {/* Format Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Export Format</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { value: 'pdf', label: 'PDF', icon: FileText, popular: true },
              { value: 'png', label: 'PNG', icon: FileImage },
              { value: 'jpg', label: 'JPG', icon: FileImage },
              { value: 'html', label: 'HTML', icon: Layout },
              { value: 'docx', label: 'DOCX', icon: FileText, coming: true }
            ].map(format => (
              <Button
                key={format.value}
                variant={exportOptions.format === format.value ? 'default' : 'outline'}
                className="h-auto p-3 flex flex-col items-center gap-2 relative"
                onClick={() => !format.coming && updateExportOptions('format', format.value)}
                disabled={format.coming}
              >
                <format.icon className="h-4 w-4" />
                <span className="text-xs">{format.label}</span>
                {format.popular && (
                  <Badge className="absolute -top-1 -right-1 text-xs px-1">Popular</Badge>
                )}
                {format.coming && (
                  <Badge variant="outline" className="absolute -top-1 -right-1 text-xs px-1">Soon</Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quality Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Quality & Settings
          </Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quality Slider */}
            <div className="space-y-2">
              <Label className="text-xs">Quality: {exportOptions.quality}%</Label>
              <Slider
                value={[exportOptions.quality]}
                onValueChange={([value]) => updateExportOptions('quality', value)}
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <Label className="text-xs">Resolution (DPI)</Label>
              <Select value={exportOptions.resolution} onValueChange={(value) => updateExportOptions('resolution', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="72">72 DPI (Web)</SelectItem>
                  <SelectItem value="150">150 DPI (Standard)</SelectItem>
                  <SelectItem value="300">300 DPI (Print)</SelectItem>
                  <SelectItem value="600">600 DPI (High Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Page Settings */}
          {exportOptions.format === 'pdf' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Page Size</Label>
                <Select value={exportOptions.pageSize} onValueChange={(value) => updateExportOptions('pageSize', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="A3">A3</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Orientation</Label>
                <Select value={exportOptions.orientation} onValueChange={(value) => updateExportOptions('orientation', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Advanced Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Include Signatures</Label>
              <Switch
                checked={exportOptions.includeSignatures}
                onCheckedChange={(checked) => updateExportOptions('includeSignatures', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs">Add Watermark</Label>
              <Switch
                checked={exportOptions.watermark}
                onCheckedChange={(checked) => updateExportOptions('watermark', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full h-12 text-base font-medium"
          >
            {isExporting ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {exportOptions.format.toUpperCase()}
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={shareDocument}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={emailDocument}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
        </div>

        {/* Export Tips */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <p><strong>Pro Tips:</strong></p>
              <ul className="space-y-1 ml-2">
                <li>• Use 300 DPI for print-quality documents</li>
                <li>• PDF format preserves all formatting</li>
                <li>• PNG supports transparency</li>
                <li>• Enable signatures for final documents</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};