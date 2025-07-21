
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Upload, Users, Mail, FileText } from "lucide-react";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

interface ClientImportExportProps {
  onBack: () => void;
}

export const ClientImportExport = ({ onBack }: ClientImportExportProps) => {
  const { data: clients } = useClients();
  const createClient = useCreateClient();
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const downloadSampleCSV = () => {
    const sampleData = [
      {
        name: "John Smith",
        email: "john@example.com",
        phone: "+1234567890",
        client_type: "B2C",
        company_name: "",
        contact_person: "",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zip_code: "10001",
        notes: "Sample client"
      },
      {
        name: "",
        email: "contact@acmecorp.com",
        phone: "+1987654321",
        client_type: "B2B",
        company_name: "ACME Corporation",
        contact_person: "Jane Doe",
        address: "456 Business Ave",
        city: "Los Angeles",
        state: "CA",
        zip_code: "90210",
        notes: "Corporate client"
      }
    ];

    const headers = Object.keys(sampleData[0]);
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_import_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Sample Downloaded",
      description: "Check your downloads folder for the sample CSV file",
    });
  };

  const exportClientsCSV = () => {
    if (!clients || clients.length === 0) {
      toast({
        title: "No Data",
        description: "No clients to export",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      'name', 'email', 'phone', 'client_type', 'company_name', 
      'contact_person', 'address', 'city', 'state', 'zip_code', 'notes'
    ];

    const csvContent = [
      headers.join(','),
      ...clients.map(client => 
        headers.map(header => {
          const value = client[header as keyof typeof client] || '';
          return `"${value}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${clients.length} clients exported successfully`,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const importClients = async () => {
    if (!csvFile) return;

    setImporting(true);
    try {
      const text = await csvFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const clientData: any = {};

          headers.forEach((header, index) => {
            if (values[index]) {
              clientData[header] = values[index];
            }
          });

          if (!clientData.name && !clientData.company_name) {
            errorCount++;
            continue;
          }

          await createClient.mutateAsync(clientData);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Error importing client:', error);
        }
      }

      toast({
        title: "Import Complete",
        description: `${successCount} clients imported successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      });

      setCsvFile(null);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Error reading CSV file",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to CRM
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Import & Export Clients</h2>
          <p className="text-muted-foreground">Manage your client data with CSV import/export</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Upload CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mt-1"
              />
            </div>
            
            {csvFile && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">Selected: {csvFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  Size: {(csvFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={importClients} 
                disabled={!csvFile || importing}
                className="flex-1"
              >
                {importing ? "Importing..." : "Import Clients"}
              </Button>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Need a template? Download our sample CSV file:
              </p>
              <Button variant="outline" size="sm" onClick={downloadSampleCSV} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Download Sample CSV Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Total Clients</p>
                  <p className="text-2xl font-bold text-blue-600">{clients?.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <Button onClick={exportClientsCSV} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export All Clients to CSV
            </Button>

            <Separator />

            <div className="text-center text-sm text-muted-foreground">
              <p>Export includes all client data including:</p>
              <ul className="text-xs mt-2 space-y-1">
                <li>• Contact information</li>
                <li>• Address details</li>
                <li>• Client type & notes</li>
                <li>• Company information (B2B)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSV Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Format Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Required CSV Columns:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <code className="bg-muted px-2 py-1 rounded">name</code>
                <code className="bg-muted px-2 py-1 rounded">email</code>
                <code className="bg-muted px-2 py-1 rounded">phone</code>
                <code className="bg-muted px-2 py-1 rounded">client_type</code>
                <code className="bg-muted px-2 py-1 rounded">company_name</code>
                <code className="bg-muted px-2 py-1 rounded">contact_person</code>
                <code className="bg-muted px-2 py-1 rounded">address</code>
                <code className="bg-muted px-2 py-1 rounded">city</code>
                <code className="bg-muted px-2 py-1 rounded">state</code>
                <code className="bg-muted px-2 py-1 rounded">zip_code</code>
                <code className="bg-muted px-2 py-1 rounded">notes</code>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Important Notes:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Either <code>name</code> or <code>company_name</code> is required</li>
                <li>• <code>client_type</code> should be either "B2B" or "B2C"</li>
                <li>• Email addresses should be valid for email campaigns</li>
                <li>• All text values should be enclosed in quotes if they contain commas</li>
                <li>• Download the sample template to see the exact format</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
