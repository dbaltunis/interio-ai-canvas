
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Trash2, Eye, Search, Calendar, User, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuotes, useDeleteQuote } from "@/hooks/useQuotes";
import { useDeleteProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface JobsTableViewProps {
  onJobSelect: (quote: any) => void;
  showFilters?: boolean;
}

export const JobsTableView = ({ onJobSelect, showFilters = false }: JobsTableViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: quotes = [], isLoading } = useQuotes();
  const deleteQuote = useDeleteQuote();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteJob = async (quote: any) => {
    try {
      console.log("Deleting job:", quote);
      
      // Delete the quote first
      if (quote.id) {
        await deleteQuote.mutateAsync(quote.id);
      }
      
      // Then delete the associated project if it exists
      if (quote.project_id) {
        await deleteProject.mutateAsync(quote.project_id);
      } else if (quote.projects?.id) {
        await deleteProject.mutateAsync(quote.projects.id);
      }
      
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search jobs, clients, or job numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Number</TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="text-gray-500 space-y-2">
                    <FileText className="h-8 w-8 mx-auto opacity-50" />
                    <p>No jobs found</p>
                    <p className="text-sm">Create your first job to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotes.map((quote) => (
                <TableRow 
                  key={quote.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onJobSelect(quote)}
                >
                  <TableCell className="font-medium">
                    #{quote.quote_number || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {quote.projects?.name || 'Untitled Project'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {quote.clients?.name || 'No Client'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status?.toUpperCase() || 'DRAFT'}
                    </Badge>
                  </TableCell>
                  <TableCell>${quote.total_amount?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    {new Date(quote.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onJobSelect(quote);
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Job</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this job? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteJob(quote)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
