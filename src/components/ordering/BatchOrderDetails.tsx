import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBatchOrderItems } from "@/hooks/useBatchOrders";
import { useOrderTrackingHistory } from "@/hooks/useOrderTracking";
import { format } from "date-fns";
import { Package, TruckIcon, Calendar, DollarSign } from "lucide-react";

interface BatchOrderDetailsProps {
  batchOrder: any;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-500' },
  ready: { label: 'Ready', color: 'bg-blue-500' },
  sent: { label: 'Sent', color: 'bg-purple-500' },
  acknowledged: { label: 'Acknowledged', color: 'bg-indigo-500' },
  in_transit: { label: 'In Transit', color: 'bg-yellow-500' },
  delivered: { label: 'Delivered', color: 'bg-green-500' },
  completed: { label: 'Completed', color: 'bg-emerald-600' },
};

export const BatchOrderDetails = ({ batchOrder }: BatchOrderDetailsProps) => {
  const { data: items, isLoading: itemsLoading } = useBatchOrderItems(batchOrder?.id);
  const { data: trackingHistory, isLoading: trackingLoading } = useOrderTrackingHistory(batchOrder?.id);

  if (!batchOrder) return null;

  const config = statusConfig[batchOrder.status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Batch Order #{batchOrder.batch_number}</CardTitle>
              <CardDescription>
                {batchOrder.suppliers?.name}
              </CardDescription>
            </div>
            <Badge className={`${config.color} text-white`}>
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Items</div>
                <div className="text-lg font-semibold">{batchOrder.total_items || 0}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Amount</div>
                <div className="text-lg font-semibold">${Number(batchOrder.total_amount || 0).toFixed(2)}</div>
              </div>
            </div>

            {batchOrder.sent_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Sent Date</div>
                  <div className="text-lg font-semibold">
                    {format(new Date(batchOrder.sent_date), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
            )}

            {batchOrder.tracking_number && (
              <div className="flex items-center gap-3">
                <TruckIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Tracking</div>
                  <div className="text-sm font-mono">{batchOrder.tracking_number}</div>
                </div>
              </div>
            )}
          </div>

          {batchOrder.notes && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium mb-1">Notes:</div>
              <div className="text-sm text-muted-foreground">{batchOrder.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          {itemsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading items...</div>
          ) : items && items.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Job/Client</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.material_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.client_name || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(item.unit_price).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(item.total_price).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.received_quantity > 0 ? (
                          <span className="text-green-600 font-medium">
                            {item.received_quantity}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No items in this batch</div>
          )}
        </CardContent>
      </Card>

      {/* Tracking History */}
      {trackingHistory && trackingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tracking History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackingHistory.map((entry, index) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${
                      index === trackingHistory.length - 1 ? 'bg-primary' : 'bg-muted-foreground'
                    }`} />
                    {index < trackingHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize">{entry.status.replace('_', ' ')}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    )}
                    {entry.location && (
                      <p className="text-sm text-muted-foreground">Location: {entry.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
