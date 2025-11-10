import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye, ShoppingCart } from "lucide-react";

export const OnlineStoreAnalyticsWidget = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Store Analytics</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Visitors</p>
            </div>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +12% this week
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Inquiries</p>
            </div>
            <p className="text-2xl font-bold">23</p>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +8% this week
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
