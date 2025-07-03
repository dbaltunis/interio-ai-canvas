import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, FileText, Calendar, DollarSign } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";

interface QuoteSelectorProps {
  selectedQuotes: any[];
  onSelectionChange: (quotes: any[]) => void;
  selectedClients?: any[];
}

export const QuoteSelector = ({ selectedQuotes, onSelectionChange, selectedClients = [] }: QuoteSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: allQuotes = [] } = useQuotes();

  // Filter quotes by selected clients if any
  const filteredQuotes = allQuotes.filter(quote => {
    const matchesSearch = quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClient = selectedClients.length === 0 || 
                         selectedClients.some(client => client.id === quote.client_id);
    
    return matchesSearch && matchesClient;
  });

  const handleQuoteToggle = (quote: any) => {
    const isSelected = selectedQuotes.some(q => q.id === quote.id);
    
    if (isSelected) {
      onSelectionChange(selectedQuotes.filter(q => q.id !== quote.id));
    } else {
      onSelectionChange([...selectedQuotes, quote]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-start">
          <FileText className="h-4 w-4 mr-2" />
          {selectedQuotes.length === 0 
            ? "Attach Quotes" 
            : `${selectedQuotes.length} Quote${selectedQuotes.length > 1 ? 's' : ''} Selected`
          }
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Quotes to Include</DialogTitle>
          <DialogDescription>
            Choose quotes to include in your email. Quote details and client information will be automatically populated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search quotes by number or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Quotes Summary */}
          {selectedQuotes.length > 0 && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Selected Quotes:</span>
                  {selectedQuotes.map(quote => (
                    <Badge 
                      key={quote.id} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => handleQuoteToggle(quote)}
                    >
                      {quote.quote_number} - {formatAmount(quote.total_amount)} ✕
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter info */}
          {selectedClients.length > 0 && (
            <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
              Showing quotes for selected clients: {selectedClients.map(c => c.name).join(", ")}
            </div>
          )}

          {/* Quotes Table */}
          <div className="flex-1 overflow-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => {
                  const isSelected = selectedQuotes.some(q => q.id === quote.id);
                  
                  return (
                    <TableRow 
                      key={quote.id} 
                      className={`cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                      onClick={() => handleQuoteToggle(quote)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleQuoteToggle(quote)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          {quote.quote_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        {quote.clients?.name || "No client"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          {formatAmount(quote.total_amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : "No expiry"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(quote.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredQuotes.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No quotes found matching your criteria</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-600">
              {selectedQuotes.length} quote{selectedQuotes.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>
                Confirm Selection
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};