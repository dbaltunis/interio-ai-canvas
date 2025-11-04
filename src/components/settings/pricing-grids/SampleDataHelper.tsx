import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';
import { downloadSampleCsv } from '@/utils/pricing/sampleData';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const SampleDataHelper = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Sample CSV Template
        </CardTitle>
        <CardDescription>
          Download a sample CSV file to see the correct format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>CSV Format Requirements:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>First column: Drop values in cm (100, 150, 200, etc.)</li>
              <li>First row: Width values in cm (50, 100, 150, etc.)</li>
              <li>All other cells: Prices in your currency</li>
              <li>No currency symbols or formatting - just numbers</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Button onClick={downloadSampleCsv} variant="outline" className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Download Sample CSV
        </Button>

        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm font-mono text-muted-foreground">
            Drop,50,100,150,200<br />
            100,45,55,65,75<br />
            150,55,65,75,85<br />
            200,65,75,85,95<br />
            250,75,85,95,105
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
