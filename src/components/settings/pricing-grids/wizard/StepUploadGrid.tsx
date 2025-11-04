import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Upload, FileText, Download, CheckCircle2 } from 'lucide-react';
import { WizardData } from '../PricingGridWizard';
import { downloadSampleCsv } from '@/utils/pricing/sampleData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StepUploadGridProps {
  wizardData: WizardData;
  updateWizardData: (updates: Partial<WizardData>) => void;
}

export const StepUploadGrid = ({ wizardData, updateWizardData }: StepUploadGridProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      updateWizardData({ csvFile: file });
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const parseCsvToGridData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have header and data rows');

    const headers = lines[0].split(',').map(h => h.trim());
    const widthColumns = headers.slice(1);

    const dropRows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return {
        drop: values[0],
        prices: values.slice(1).map(p => parseFloat(p) || 0)
      };
    });

    return { widthColumns, dropRows };
  };

  const handleCreateGrid = async () => {
    if (!wizardData.gridName || !wizardData.gridCode || !wizardData.csvFile) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const csvText = await wizardData.csvFile.text();
      const gridData = parseCsvToGridData(csvText);

      const { data, error } = await supabase
        .from('pricing_grids')
        .insert({
          user_id: user.id,
          name: wizardData.gridName,
          grid_code: wizardData.gridCode,
          description: wizardData.gridDescription || null,
          grid_data: gridData,
          active: true
        })
        .select()
        .single();

      if (error) throw error;

      updateWizardData({ 
        gridData,
        createdGridId: data.id 
      });
      
      toast.success('Price list uploaded successfully!');
    } catch (error: any) {
      console.error('Error creating pricing grid:', error);
      toast.error(error.message || 'Failed to create pricing grid');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Upload Your Price List</h3>
        <p className="text-muted-foreground">
          Create a pricing grid from a CSV file with your width × height prices
        </p>
      </div>

      {wizardData.createdGridId ? (
        <Alert className="bg-green-500/10 border-green-500/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Price list "{wizardData.gridName}" uploaded successfully! Continue to the next step to connect it to your products.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Sample Download */}
          <Card className="p-4 bg-blue-500/5 border-blue-500/20">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Need a template?</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Download our sample CSV to see the correct format
                </p>
                <Button onClick={downloadSampleCsv} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample CSV
                </Button>
              </div>
            </div>
          </Card>

          {/* CSV Format */}
          <Alert>
            <AlertDescription>
              <strong>CSV Format:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>First column: Drop/Height values (e.g., 100, 150, 200...)</li>
                <li>First row: Width values (e.g., 50, 100, 150...)</li>
                <li>All other cells: Prices (numbers only, no symbols)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grid-name">
                  Price List Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="grid-name"
                  placeholder="e.g., Roller Cassette Group A"
                  value={wizardData.gridName}
                  onChange={(e) => updateWizardData({ gridName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grid-code">
                  Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="grid-code"
                  placeholder="e.g., ROLLER_CASS_A"
                  value={wizardData.gridCode}
                  onChange={(e) => updateWizardData({ gridCode: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grid-description">Description (Optional)</Label>
              <Textarea
                id="grid-description"
                placeholder="e.g., Standard pricing for roller blinds with cassette system, fabric group A"
                value={wizardData.gridDescription}
                onChange={(e) => updateWizardData({ gridDescription: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="csv-file">
                CSV File <span className="text-destructive">*</span>
              </Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
              />
              {wizardData.csvFile && (
                <p className="text-sm text-muted-foreground">
                  ✓ {wizardData.csvFile.name}
                </p>
              )}
            </div>

            <Button 
              onClick={handleCreateGrid}
              disabled={isUploading || !wizardData.gridName || !wizardData.gridCode || !wizardData.csvFile}
              className="w-full"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Price List'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
