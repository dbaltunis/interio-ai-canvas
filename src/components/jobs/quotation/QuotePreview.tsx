
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";

interface QuotePreviewProps {
  project: any;
  treatments: any[];
  rooms: any[];
  surfaces: any[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  markupPercentage: number;
}

export const QuotePreview = ({
  project,
  treatments,
  rooms,
  surfaces,
  subtotal,
  taxRate,
  taxAmount,
  total,
  markupPercentage
}: QuotePreviewProps) => {
  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.name || 'Unknown Room';
  };

  const getSurfaceName = (surfaceId: string) => {
    const surface = surfaces.find(s => s.id === surfaceId);
    return surface?.name || 'Unknown Surface';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const today = new Date().toLocaleDateString();
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Quote Preview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-4xl mx-auto bg-white p-8 border rounded-lg shadow-sm">
          {/* Quote Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">QUOTATION</h1>
                <p className="text-gray-600">Project: {project.name}</p>
                <p className="text-gray-600">Job #: {project.job_number || 'TBD'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Date: {today}</p>
                <p className="text-sm text-gray-600">Valid Until: {validUntil}</p>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Client Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Quote For:</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-medium">Client Name</p>
              <p className="text-gray-600">Project Address</p>
              <p className="text-gray-600">Contact Information</p>
            </div>
          </div>

          {/* Treatment Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Window Treatment Specifications:</h3>
            <div className="space-y-4">
              {treatments.map((treatment) => {
                const baseCost = treatment.total_price || 0;
                const markupAmount = baseCost * (markupPercentage / 100);
                const lineTotal = baseCost + markupAmount;

                return (
                  <div key={treatment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{getRoomName(treatment.room_id)}</h4>
                          <Badge variant="secondary" className="capitalize">
                            {treatment.treatment_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Surface: {getSurfaceName(treatment.window_id)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Product: {treatment.product_name || treatment.treatment_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(lineTotal)}</div>
                      </div>
                    </div>

                    {/* Treatment Details */}
                    {treatment.fabric_details && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        <p><strong>Fabric:</strong> {treatment.fabric_details.fabric_type}</p>
                        {treatment.fabric_details.color && (
                          <p><strong>Color:</strong> {treatment.fabric_details.color}</p>
                        )}
                        {treatment.measurements && (
                          <p><strong>Dimensions:</strong> {treatment.measurements.width}" W x {treatment.measurements.height}" H</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-brand-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-8 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Quote valid for 30 days from date issued</li>
              <li>• 50% deposit required to commence work</li>
              <li>• Installation included in pricing</li>
              <li>• Final measurements will be taken before manufacturing</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
