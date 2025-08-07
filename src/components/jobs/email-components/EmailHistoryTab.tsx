import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Mail, RefreshCw, Loader2, Plus, Search, Filter, X, Eye, MousePointer } from "lucide-react";
import { EmailStatusBadge } from "./EmailStatusBadge";
import { EmailDetailDialog } from "./EmailDetailDialog";
import { AttachmentInfo } from "./AttachmentInfo";
import { useQueryClient } from "@tanstack/react-query";
import type { Email } from "@/hooks/useEmails";

interface AttachmentData {
  filename: string;
  type: string;
  size: number;
}

interface EmailHistoryTabProps {
  emails: Email[] | undefined;
  emailsLoading: boolean;
  onComposeClick: () => void;
  onResendEmail: (email: Email) => void;
  isResending: boolean;
}

const EMAIL_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'opened', label: 'Opened' },
  { value: 'clicked', label: 'Clicked' },
  { value: 'bounced', label: 'Bounced' },
  { value: 'failed', label: 'Failed' },
  { value: 'spam', label: 'Spam' }
];

const PAGE_SIZES = [10, 20, 50, 100];

export const EmailHistoryTab = ({ 
  emails, 
  emailsLoading, 
  onComposeClick, 
  onResendEmail,
  isResending 
}: EmailHistoryTabProps) => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailDetailOpen, setEmailDetailOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setEmailDetailOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['emails'] });
      await queryClient.invalidateQueries({ queryKey: ['email-kpis'] });
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Filter and search emails
  const filteredEmails = emails?.filter(email => {
    const matchesSearch = !searchQuery || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.recipient_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Pagination calculations
  const totalEmails = filteredEmails.length;
  const totalPages = Math.ceil(totalEmails / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEmails = filteredEmails.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-semibold">Email History</h3>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground rounded-full text-xs px-2 py-0.5 ml-1">
                  {(searchQuery ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter Emails</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Page Size</label>
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    setPageSize(parseInt(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} per page
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Results Info */}
      {filteredEmails.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, totalEmails)} of {totalEmails} emails
          {hasActiveFilters && emails && filteredEmails.length < emails.length && (
            <span> (filtered from {emails.length} total)</span>
          )}
        </div>
      )}
      
      {emailsLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading emails...</span>
        </div>
      ) : paginatedEmails.length > 0 ? (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Attachments</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {paginatedEmails.map((email) => (
                    <TableRow 
                      key={email.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEmailClick(email)}
                    >
                      <TableCell>
                        <div className="font-medium truncate max-w-[200px]">{email.subject}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{email.recipient_email}</div>
                      </TableCell>
                      <TableCell>
                        <EmailStatusBadge status={email.status || 'queued'} />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : 'Not sent'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{email.open_count || 0}</div>
                          {email.open_count > 0 && (
                            <Eye className="h-3 w-3 text-primary" />
                          )}
                          {email.click_count > 0 && (
                            <MousePointer className="h-3 w-3 text-orange-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <AttachmentInfo 
                          attachments={(email.attachment_info as unknown as AttachmentData[]) || []} 
                          className="max-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          {/* Actions placeholder */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : hasActiveFilters ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Emails Found</h3>
            <p className="text-muted-foreground mb-4">
              No emails match your current search and filter criteria.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Emails Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start sending emails to see your email history here.
            </p>
            <Button onClick={onComposeClick}>
              <Plus className="h-4 w-4 mr-2" />
              Send Your First Email
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Email Detail Dialog */}
      <EmailDetailDialog
        open={emailDetailOpen}
        onOpenChange={setEmailDetailOpen}
        email={selectedEmail}
        onResendEmail={onResendEmail}
        isResending={isResending}
      />
    </div>
  );
};
