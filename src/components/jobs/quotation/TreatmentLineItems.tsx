
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Settings } from "lucide-react";

interface TreatmentLineItemsProps {
  treatments: any[];
  rooms: any[];
  surfaces: any[];
  markupPercentage: number;
  onMarkupChange: (percentage: number) => void;
}

export const TreatmentLineItems = ({
  treatments,
  rooms,
  surfaces,
  markupPercentage,
  onMarkupChange
}: TreatmentLineItemsProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Treatment Line Items</span>
        </CardTitle>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <Label htmlFor="markup">Markup %:</Label>
            <Input
              id="markup"
              type="number"
              min="0"
              max="200"
              value={markupPercentage}
              onChange={(e) => onMarkupChange(parseFloat(e.target.value) || 0)}
              className="w-20"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {treatments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-4xl mb-2">📋</div>
            <h4 className="font-medium text-gray-900 mb-1">No treatments added</h4>
            <p className="text-sm text-gray-500">Add treatments to rooms to generate quote line items</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Surface</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Base Cost</TableHead>
                  <TableHead className="text-right">Markup</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatments.map((treatment) => {
                  const baseCost = treatment.total_price || 0;
                  const markupAmount = baseCost * (markupPercentage / 100);
                  const lineTotal = baseCost + markupAmount;

                  return (
                    <TableRow key={treatment.id}>
                      <TableCell>
                        <div className="font-medium">{getRoomName(treatment.room_id)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {getSurfaceName(treatment.window_id)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {treatment.treatment_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {treatment.product_name || treatment.treatment_type}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(baseCost)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        +{formatCurrency(markupAmount)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(lineTotal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
