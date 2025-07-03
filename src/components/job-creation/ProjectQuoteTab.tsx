
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Edit, Save } from "lucide-react";
import { useState } from "react";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useTreatments } from "@/hooks/useTreatments";
import { useClients } from "@/hooks/useClients";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

interface ProjectQuoteTabProps {
  project: any;
}

export const ProjectQuoteTab = ({ project }: ProjectQuoteTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [quoteData, setQuoteData] = useState({
    terms: "Payment due within 30 days of completion.",
    notes: "All measurements are approximate and subject to field verification.",
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const { data: rooms } = useRooms(project.id);
  const { data: surfaces } = useSurfaces(project.id);
  const { data: treatments } = useTreatments(project.id);
  const { data: clients } = useClients();
  const { data: businessSettings } = useBusinessSettings();

  const client = clients?.find(c => c.id === project.client_id);
  const projectTreatments = treatments?.filter(t => t.project_id === project.id) || [];
  
  const subtotal = projectTreatments.reduce((sum, t) => sum + (t.total_price || 0), 0);
  const taxRate = (businessSettings?.default_tax_rate || 8) / 100;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6 no-print">
        <h3 className="text-xl font-semibold">Professional Quote</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? 'Save' : 'Edit'}
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Print/Save PDF
          </Button>
        </div>
      </div>

      {/* Quote Document */}
      <div className="border border-gray-200 p-8 print:border-none print:p-0">
        {/* Company Header with Logo */}
        <div className="text-center border-b pb-6 mb-6">
          {businessSettings?.company_logo_url && (
            <div className="mb-4 flex justify-center">
              <img 
                src={businessSettings.company_logo_url} 
                alt="Company Logo" 
                className="h-16 w-auto max-w-64 object-contain"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900">
            {businessSettings?.company_name || 'Your Company Name'}
          </h1>
          <p className="text-gray-600">Professional Window Treatments & Interior Design</p>
          <div className="text-sm text-gray-500 space-y-1">
            {businessSettings?.business_address && <p>{businessSettings.business_address}</p>}
            <div className="flex justify-center space-x-4">
              {businessSettings?.business_phone && <span>{businessSettings.business_phone}</span>}
              {businessSettings?.business_email && <span>{businessSettings.business_email}</span>}
            </div>
          </div>
        </div>

        {/* Quote Header */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">QUOTE</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Quote #:</span> {project.job_number || 'QUOTE-001'}</p>
              <p><span className="font-medium">Date:</span> {new Date().toLocaleDateString()}</p>
              <p><span className="font-medium">Valid Until:</span> 
                {isEditing ? (
                  <Input 
                    type="date" 
                    value={quoteData.validUntil}
                    onChange={(e) => setQuoteData({...quoteData, validUntil: e.target.value})}
                    className="inline-block w-auto ml-2"
                  />
                ) : (
                  <span className="ml-2">{new Date(quoteData.validUntil).toLocaleDateString()}</span>
                )}
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">BILL TO:</h3>
            <div className="space-y-1">
              <p className="font-medium">{client?.name}</p>
              {client?.client_type === 'B2B' && client?.company_name && (
                <p>{client.company_name}</p>
              )}
              {client?.address && <p>{client.address}</p>}
              {client?.city && client?.state && client?.zip_code && (
                <p>{client.city}, {client.state} {client.zip_code}</p>
              )}
              {client?.phone && <p>Phone: {client.phone}</p>}
              {client?.email && <p>Email: {client.email}</p>}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">PROJECT DETAILS</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p><span className="font-medium">Project:</span> {project.name}</p>
            {project.description && <p><span className="font-medium">Description:</span> {project.description}</p>}
            <p><span className="font-medium">Total Rooms:</span> {rooms?.length || 0}</p>
            <p><span className="font-medium">Total Surfaces:</span> {surfaces?.length || 0}</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Material</TableHead>
                <TableHead className="text-right">Labor</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectTreatments.map((treatment, index) => {
                const surface = surfaces?.find(s => s.id === treatment.window_id);
                const room = rooms?.find(r => r.id === treatment.room_id);
                
                return (
                  <TableRow key={treatment.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{treatment.product_name || treatment.treatment_type}</p>
                        {treatment.fabric_type && <p className="text-sm text-gray-500">{treatment.fabric_type}</p>}
                        {treatment.color && <p className="text-sm text-gray-500">Color: {treatment.color}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{room?.name || 'Unknown Room'}</p>
                        <p className="text-sm text-gray-500">{surface?.name || 'Unknown Surface'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(treatment.material_cost || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(treatment.labor_cost || 0)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(treatment.total_price || 0)}</TableCell>
                  </TableRow>
                );
              })}
              {projectTreatments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No items added yet. Complete the job setup to generate quote items.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Notes */}
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
            {isEditing ? (
              <Textarea
                value={quoteData.terms}
                onChange={(e) => setQuoteData({...quoteData, terms: e.target.value})}
                className="min-h-20"
              />
            ) : (
              <p className="text-sm text-gray-700">{quoteData.terms}</p>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-2">Notes:</h4>
            {isEditing ? (
              <Textarea
                value={quoteData.notes}
                onChange={(e) => setQuoteData({...quoteData, notes: e.target.value})}
                className="min-h-20"
              />
            ) : (
              <p className="text-sm text-gray-700">{quoteData.notes}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t text-sm text-gray-500">
          <p>Thank you for choosing our services!</p>
          <p>This quote is valid until {new Date(quoteData.validUntil).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};
