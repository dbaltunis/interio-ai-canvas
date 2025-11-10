import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock } from "lucide-react";

export const OnlineStoreOrdersWidget = () => {
  const recentInquiries = [
    { id: 1, customer: "John Smith", type: "Quote Request", time: "2h ago", status: "new" },
    { id: 2, customer: "Sarah Johnson", type: "Product Inquiry", time: "5h ago", status: "contacted" },
    { id: 3, customer: "Mike Brown", type: "Booking Request", time: "1d ago", status: "quoted" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Recent Inquiries</CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentInquiries.map((inquiry) => (
            <div key={inquiry.id} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div className="space-y-1">
                <p className="text-sm font-medium">{inquiry.customer}</p>
                <p className="text-xs text-muted-foreground">{inquiry.type}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="outline" className="text-xs capitalize">
                  {inquiry.status}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {inquiry.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
