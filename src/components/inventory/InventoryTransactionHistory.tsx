import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInventoryTransactions } from "@/hooks/useInventoryTransactions";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Package, RefreshCw } from "lucide-react";

interface InventoryTransactionHistoryProps {
  inventoryItemId?: string;
}

export const InventoryTransactionHistory = ({ inventoryItemId }: InventoryTransactionHistoryProps) => {
  const { data: transactions, isLoading } = useInventoryTransactions(inventoryItemId);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'return':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'sale':
      case 'allocation':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'return':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sale':
      case 'allocation':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'adjustment':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading transactions...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No transactions recorded yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getTransactionIcon(transaction.transaction_type)}
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getTransactionColor(transaction.transaction_type)}>
                      {transaction.transaction_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="font-medium">
                      {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} units
                    </span>
                  </div>
                  {transaction.notes && (
                    <p className="text-sm text-muted-foreground mt-1">{transaction.notes}</p>
                  )}
                  {transaction.reference_type && transaction.reference_id && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Ref: {transaction.reference_type} - {transaction.reference_id.slice(0, 8)}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                {transaction.total_cost && (
                  <div className="font-medium">
                    ${transaction.total_cost.toFixed(2)}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
