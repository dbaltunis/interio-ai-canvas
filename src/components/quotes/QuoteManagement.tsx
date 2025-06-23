
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Edit, Download } from "lucide-react";

const mockQuotes = [
  {
    id: "Q-2024-001",
    client: "Sarah Wilson",
    project: "Living Room Renovation",
    total: "$2,450.00",
    status: "pending",
    date: "2024-01-15",
    items: "Velvet curtains, Roman blinds"
  },
  {
    id: "Q-2024-002", 
    client: "Michael Chen",
    project: "Office Upgrade",
    total: "$1,890.00",
    status: "approved",
    date: "2024-01-14",
    items: "Vertical blinds, Blackout curtains"
  },
  {
    id: "Q-2024-003",
    client: "Emma Thompson",
    project: "Bedroom Suite",
    total: "$3,200.00",
    status: "draft",
    date: "2024-01-13",
    items: "Silk curtains, Motorized blinds"
  }
];

export const QuoteManagement = () => {
  const [quotes] = useState(mockQuotes);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "draft": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quote Management</h2>
          <p className="text-muted-foreground">
            Create, manage, and track all your quotes in one place
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Quote
        </Button>
      </div>

      {/* AI Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Quick Actions</CardTitle>
          <CardDescription>Let AI help you with common quote tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <span className="font-medium">Smart Quote</span>
              <span className="text-xs text-muted-foreground">AI suggests fabrics & pricing</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="font-medium">Bulk Pricing</span>
              <span className="text-xs text-muted-foreground">Calculate multiple treatments</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="font-medium">Follow-up</span>
              <span className="text-xs text-muted-foreground">AI drafts follow-up emails</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.id}</TableCell>
                  <TableCell>{quote.client}</TableCell>
                  <TableCell>{quote.project}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{quote.items}</TableCell>
                  <TableCell className="font-medium">{quote.total}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{quote.date}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
