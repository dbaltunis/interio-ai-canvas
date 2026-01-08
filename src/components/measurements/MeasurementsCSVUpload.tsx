import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, FileSpreadsheet, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateClientMeasurement } from "@/hooks/useClientMeasurements";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MeasurementsCSVUploadProps {
  clientId: string;
  onSuccess?: () => void;
}

interface ParsedMeasurement {
  room_name: string;
  window_name: string;
  width_mm: number;
  height_mm: number;
  ceiling_height_mm?: number;
  floor_clearance_mm?: number;
  window_to_ceiling_mm?: number;
  left_clearance_mm?: number;
  right_clearance_mm?: number;
  rod_type?: string;
  rod_length_mm?: number;
  bracket_count?: number;
  notes?: string;
}

const EXAMPLE_CSV = `room_name,window_name,width_mm,height_mm,ceiling_height_mm,floor_clearance_mm,window_to_ceiling_mm,left_clearance_mm,right_clearance_mm,rod_type,rod_length_mm,bracket_count,notes
Living Room,Window 1,2000,1500,2700,100,200,150,150,track,2300,3,Bay window - check angle
Living Room,Window 2,1200,1800,2700,50,100,100,100,rod,1500,2,Standard install
Bedroom,Window 1,1800,1600,2500,80,150,120,120,motorized_track,2100,3,Needs power point nearby
Kitchen,Window 1,900,1200,2400,0,300,75,75,tension_rod,950,0,Above sink - moisture resistant`;

export const MeasurementsCSVUpload = ({ clientId, onSuccess }: MeasurementsCSVUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createMeasurement = useCreateClientMeasurement();

  const downloadExampleCSV = () => {
    const blob = new Blob([EXAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'measurements_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): ParsedMeasurement[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['room_name', 'window_name', 'width_mm', 'height_mm'];
    
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        throw new Error(`Missing required column: ${required}`);
      }
    }

    const measurements: ParsedMeasurement[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Validate required fields
      if (!row.room_name || !row.window_name) {
        errors.push(`Row ${i + 1}: Missing room_name or window_name`);
        continue;
      }

      const widthMm = parseInt(row.width_mm);
      const heightMm = parseInt(row.height_mm);

      if (isNaN(widthMm) || widthMm <= 0) {
        errors.push(`Row ${i + 1}: Invalid width_mm`);
        continue;
      }

      if (isNaN(heightMm) || heightMm <= 0) {
        errors.push(`Row ${i + 1}: Invalid height_mm`);
        continue;
      }

      measurements.push({
        room_name: row.room_name,
        window_name: row.window_name,
        width_mm: widthMm,
        height_mm: heightMm,
        ceiling_height_mm: row.ceiling_height_mm ? parseInt(row.ceiling_height_mm) : undefined,
        floor_clearance_mm: row.floor_clearance_mm ? parseInt(row.floor_clearance_mm) : undefined,
        window_to_ceiling_mm: row.window_to_ceiling_mm ? parseInt(row.window_to_ceiling_mm) : undefined,
        left_clearance_mm: row.left_clearance_mm ? parseInt(row.left_clearance_mm) : undefined,
        right_clearance_mm: row.right_clearance_mm ? parseInt(row.right_clearance_mm) : undefined,
        rod_type: row.rod_type || undefined,
        rod_length_mm: row.rod_length_mm ? parseInt(row.rod_length_mm) : undefined,
        bracket_count: row.bracket_count ? parseInt(row.bracket_count) : undefined,
        notes: row.notes || undefined,
      });
    }

    setParseErrors(errors);
    return measurements;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setParseErrors([]);
    setSuccessCount(0);

    try {
      const text = await file.text();
      const measurements = parseCSV(text);

      if (measurements.length === 0) {
        toast({
          title: "No valid measurements",
          description: "Could not find any valid measurements in the CSV file",
          variant: "destructive"
        });
        return;
      }

      let successfulSaves = 0;

      for (const measurement of measurements) {
        try {
          await createMeasurement.mutateAsync({
            client_id: clientId,
            measurement_type: 'window',
            measurements: {
              room_name: measurement.room_name,
              window_name: measurement.window_name,
              width_mm: measurement.width_mm,
              height_mm: measurement.height_mm,
              ceiling_height_mm: measurement.ceiling_height_mm,
              floor_clearance_mm: measurement.floor_clearance_mm,
              window_to_ceiling_mm: measurement.window_to_ceiling_mm,
              left_clearance_mm: measurement.left_clearance_mm,
              right_clearance_mm: measurement.right_clearance_mm,
              rod_type: measurement.rod_type,
              rod_length_mm: measurement.rod_length_mm,
              bracket_count: measurement.bracket_count,
            },
            photos: [],
            notes: measurement.notes,
            measured_at: new Date().toISOString(),
          });
          successfulSaves++;
        } catch (err) {
          console.error('Failed to save measurement:', err);
        }
      }

      setSuccessCount(successfulSaves);
      toast({
        title: "Import complete",
        description: `Successfully imported ${successfulSaves} of ${measurements.length} measurements`,
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to parse CSV file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Import Measurements from CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Upload a CSV file with window measurements. Download the template to see the required format.
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadExampleCSV}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Importing...' : 'Upload CSV'}
          </Button>
        </div>

        {parseErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Some rows had errors:</p>
              <ul className="text-xs list-disc pl-4">
                {parseErrors.slice(0, 5).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
                {parseErrors.length > 5 && (
                  <li>...and {parseErrors.length - 5} more errors</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {successCount > 0 && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              Successfully imported {successCount} measurements
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">CSV Columns:</p>
          <ul className="grid grid-cols-2 gap-1 text-[10px]">
            <li><span className="text-destructive">*</span> room_name - Room identifier</li>
            <li><span className="text-destructive">*</span> window_name - Window name</li>
            <li><span className="text-destructive">*</span> width_mm - Window width</li>
            <li><span className="text-destructive">*</span> height_mm - Window height</li>
            <li>ceiling_height_mm - Floor to ceiling</li>
            <li>floor_clearance_mm - From floor</li>
            <li>window_to_ceiling_mm - To ceiling</li>
            <li>left_clearance_mm - Left clearance</li>
            <li>right_clearance_mm - Right clearance</li>
            <li>rod_type - rod/track/motorized_track</li>
            <li>rod_length_mm - Total rod length</li>
            <li>bracket_count - Number of brackets</li>
            <li>notes - Special instructions</li>
          </ul>
          <p className="text-destructive">* Required fields</p>
        </div>
      </CardContent>
    </Card>
  );
};
