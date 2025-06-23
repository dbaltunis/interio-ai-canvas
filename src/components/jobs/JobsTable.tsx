
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuotes } from "@/hooks/useQuotes";
import { FileText, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface JobsTableProps {
  searchClient: string;
  searchJobNumber: string;
  filterStatus: string;
  filterDeposit: string;
  filterOwner: string;
  filterMaker: string;
  onJobSelect?: (jobId: string) => void;
}

export const JobsTable = ({ 
  searchClient,
  searchJobNumber,
  filterStatus,
  filterDeposit,
  filterOwner,
  filterMaker,
  onJobSelect
}: JobsTableProps) => {
  const { data: quotes } = useQuotes();

  // Filter quotes based on search and filter criteria
  const filteredQuotes = quotes?.filter(quote => {
    const matchesClient = !searchClient || 
      quote.client_id.toLowerCase().includes(searchClient.toLowerCase());
    const matchesJobNumber = !searchJobNumber || 
      quote.quote_number.toLowerCase().includes(searchJobNumber.toLowerCase());
    const matchesStatus = filterStatus === "all" || quote.status === filterStatus;
    
    return matchesClient && matchesJobNumber && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-pink-100 text-pink-800";
      case "order": return "bg-blue-100 text-blue-800";
      case "invoice": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-pink-100 text-pink-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return "Quote";
      case "order": return "Order";
      case "invoice": return "Invoice";
      case "completed": return "Completed";
      default: return "Quote";
    }
  };

  if (!quotes || quotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No jobs yet</h3>
          <p className="text-muted-foreground">
            Create your first job to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* Table Header */}
      <div className="grid grid-cols-8 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-gray-700">
        <div>No.</div>
        <div>Quote Total</div>
        <div>Payment</div>
        <div>Client Name</div>
        <div>Mobile</div>
        <div>Calendar</div>
        <div>Status</div>
        <div>Team</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y">
        {filteredQuotes.map((quote) => (
          <div 
            key={quote.id} 
            className="grid grid-cols-8 gap-4 p-4 items-center hover:bg-gray-50 cursor-pointer"
            onClick={() => onJobSelect?.(quote.id)}
          >
            <div className="font-medium text-gray-900">{quote.quote_number}</div>
            <div className="font-medium">${quote.total_amount?.toFixed(2) || '0.00'}</div>
            <div className="text-gray-500">-</div>
            <div className="text-gray-900">Client #{quote.client_id.slice(0, 8)}</div>
            <div className="text-gray-500">-</div>
            <div className="text-gray-900">{new Date(quote.created_at).toLocaleDateString('en-GB')}</div>
            <div>
              <Badge className={`${getStatusColor(quote.status)} border-0`} variant="secondary">
                {getStatusLabel(quote.status)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-6 h-6 bg-slate-600 rounded-full mr-2 flex items-center justify-center text-white text-xs">
                  A
                </div>
                <span>InterioApp Admin</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem>View Job</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
