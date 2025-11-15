import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type PricingGridType = 'width' | 'drop' | 'matrix';

export interface PricingGridRow {
  min_width?: number;
  max_width?: number;
  min_drop?: number;
  max_drop?: number;
  width?: number;
  drop?: number;
  price: number;
}

interface PricingGridUploadProps {
  value?: PricingGridRow[];
  onChange: (data: PricingGridRow[]) => void;
  gridType?: PricingGridType;
  onGridTypeChange?: (type: PricingGridType) => void;
}

export const PricingGridUpload = ({ 
  value = [], 
  onChange, 
  gridType = 'width',
  onGridTypeChange 
}: PricingGridUploadProps) => {
  const [parseError, setParseError] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const { toast } = useToast();

  const generateTemplate = (type: PricingGridType): string => {
    switch (type) {
      case 'width':
        return `min_width_cm,max_width_cm,price\n0,60,250.00\n61,90,350.00\n91,120,450.00\n121,150,550.00`;
      case 'drop':
        return `min_drop_cm,max_drop_cm,price\n0,150,200.00\n151,220,300.00\n221,270,400.00\n271,320,500.00`;
      case 'matrix':
        return `width_cm,drop_cm,price\n60,150,250.00\n60,220,300.00\n90,150,350.00\n90,220,400.00\n120,150,450.00\n120,220,500.00`;
    }
  };

  const downloadTemplate = () => {
    const csv = generateTemplate(gridType);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pricing-grid-template-${gridType}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template downloaded",
      description: `${gridType} pricing grid template downloaded successfully`,
    });
  };

  const validateAndParseCSV = (csvText: string): PricingGridRow[] | null => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error("CSV must have at least a header row and one data row");
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows: PricingGridRow[] = [];

      // Validate headers based on grid type
      const expectedHeaders: Record<PricingGridType, string[]> = {
        width: ['min_width_cm', 'max_width_cm', 'price'],
        drop: ['min_drop_cm', 'max_drop_cm', 'price'],
        matrix: ['width_cm', 'drop_cm', 'price']
      };

      const expected = expectedHeaders[gridType];
      const hasAllHeaders = expected.every(h => headers.includes(h));
      
      if (!hasAllHeaders) {
        throw new Error(`Invalid headers. Expected: ${expected.join(', ')}`);
      }

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) {
          throw new Error(`Row ${i} has incorrect number of columns`);
        }

        const row: PricingGridRow = {} as PricingGridRow;
        
        headers.forEach((header, index) => {
          const value = parseFloat(values[index]);
          if (isNaN(value)) {
            throw new Error(`Row ${i}: "${values[index]}" is not a valid number`);
          }
          
          switch (header) {
            case 'min_width_cm':
              row.min_width = value;
              break;
            case 'max_width_cm':
              row.max_width = value;
              break;
            case 'min_drop_cm':
              row.min_drop = value;
              break;
            case 'max_drop_cm':
              row.max_drop = value;
              break;
            case 'width_cm':
              row.width = value;
              break;
            case 'drop_cm':
              row.drop = value;
              break;
            case 'price':
              row.price = value;
              break;
          }
        });

        rows.push(row);
      }

      return rows;
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Failed to parse CSV");
      return null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = validateAndParseCSV(text);
      
      if (parsed) {
        onChange(parsed);
        setParseError(null);
        setIsValidated(true);
        toast({
          title: "CSV uploaded successfully",
          description: `Loaded ${parsed.length} pricing rows`,
        });
      } else {
        setIsValidated(false);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Pricing Grid Type</Label>
          <Select value={gridType} onValueChange={(val) => onGridTypeChange?.(val as PricingGridType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="width">Width-based (Range)</SelectItem>
              <SelectItem value="drop">Drop/Height-based (Range)</SelectItem>
              <SelectItem value="matrix">Width × Drop Matrix</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="csv-upload">Upload Pricing Grid CSV</Label>
        <div className="flex items-center gap-2 mt-2">
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="flex-1"
          />
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {parseError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

      {isValidated && value.length > 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            ✓ Pricing grid validated: {value.length} rows loaded
          </AlertDescription>
        </Alert>
      )}

      {value.length > 0 && (
        <div className="border rounded-lg p-4">
          <Label className="text-sm font-semibold mb-2 block">Preview</Label>
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {gridType === 'width' && (
                    <>
                      <th className="text-left p-2">Min Width (cm)</th>
                      <th className="text-left p-2">Max Width (cm)</th>
                    </>
                  )}
                  {gridType === 'drop' && (
                    <>
                      <th className="text-left p-2">Min Drop (cm)</th>
                      <th className="text-left p-2">Max Drop (cm)</th>
                    </>
                  )}
                  {gridType === 'matrix' && (
                    <>
                      <th className="text-left p-2">Width (cm)</th>
                      <th className="text-left p-2">Drop (cm)</th>
                    </>
                  )}
                  <th className="text-left p-2">Price (£)</th>
                </tr>
              </thead>
              <tbody>
                {value.map((row, index) => (
                  <tr key={index} className="border-b">
                    {gridType === 'width' && (
                      <>
                        <td className="p-2">{row.min_width}</td>
                        <td className="p-2">{row.max_width}</td>
                      </>
                    )}
                    {gridType === 'drop' && (
                      <>
                        <td className="p-2">{row.min_drop}</td>
                        <td className="p-2">{row.max_drop}</td>
                      </>
                    )}
                    {gridType === 'matrix' && (
                      <>
                        <td className="p-2">{row.width}</td>
                        <td className="p-2">{row.drop}</td>
                      </>
                    )}
                    <td className="p-2">£{row.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
