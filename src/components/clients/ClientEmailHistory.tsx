
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Plus, Eye, MousePointer, Calendar, ArrowRight } from "lucide-react";
import { useClientEmails } from "@/hooks/useClientEmails";
import { EmailStatusBadge } from "../jobs/email-components/EmailStatusBadge";
import { PixelMessageIcon } from "@/components/icons/PixelArtIcons";
import { EmailDetailDialog } from "../jobs/email-components/EmailDetailDialog";
import type { Email } from "@/hooks/useEmails";

interface ClientEmailHistoryProps {
  clientId: string;
  clientEmail?: string;
  onComposeEmail?: () => void;
}

export const ClientEmailHistory = ({ clientId, clientEmail, onComposeEmail }: ClientEmailHistoryProps) => {
  const { data: emails, isLoading } = useClientEmails(clientId);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailDetailOpen, setEmailDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setEmailDetailOpen(true);
  };

  // Pagination
  const totalPages = emails ? Math.ceil(emails.length / pageSize) : 0;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEmails = emails ? emails.slice(startIndex, endIndex) : [];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (emailDetailOpen || (e.target as HTMLElement).tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, paginatedEmails.length - 1));
          break;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (paginatedEmails[focusedIndex]) {
            handleEmailClick(paginatedEmails[focusedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [emailDetailOpen, focusedIndex, paginatedEmails]);

  useEffect(() => {
    setFocusedIndex(0);
  }, [currentPage]);

  const emailStats = emails ? {
    total: emails.length,
    sent: emails.filter(e => !['draft', 'queued'].includes(e.status)).length,
    opened: emails.filter(e => (e.open_count || 0) > 0).length,
    clicked: emails.filter(e => (e.click_count || 0) > 0).length,
    totalOpens: emails.reduce((sum, e) => sum + (e.open_count || 0), 0),
    totalClicks: emails.reduce((sum, e) => sum + (e.click_count || 0), 0)
  } : null;

  if (isLoading) {
    return <div className="text-center py-4">Loading email history...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Email Stats Overview */}
      {emailStats && emailStats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card variant="analytics">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-foreground">{emailStats.total}</div>
              <div className="text-xs text-muted-foreground">Total Emails</div>
            </CardContent>
          </Card>
          <Card variant="analytics">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-emerald-600">{emailStats.sent}</div>
              <div className="text-xs text-muted-foreground">Sent</div>
            </CardContent>
          </Card>
          <Card variant="analytics">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Eye className="h-3.5 w-3.5 text-primary" />
                <div className="text-xl font-bold text-primary">{emailStats.totalOpens}</div>
              </div>
              <div className="text-xs text-muted-foreground">Total Opens</div>
            </CardContent>
          </Card>
          <Card variant="analytics">
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <MousePointer className="h-3.5 w-3.5 text-orange-600" />
                <div className="text-xl font-bold text-orange-600">{emailStats.totalClicks}</div>
              </div>
              <div className="text-xs text-muted-foreground">Total Clicks</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email History */}
      <Card variant="analytics">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Email History
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {emails && emails.length > 10 && (
                <Select value={pageSize.toString()} onValueChange={(val) => setPageSize(parseInt(val))}>
                  <SelectTrigger className="w-[100px] h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {clientEmail && onComposeEmail && (
                <Button onClick={onComposeEmail} size="sm" className="h-7 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Compose
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border-b">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          ) : !emails || emails.length === 0 ? (
            <div className="empty-state">
              <PixelMessageIcon size={48} className="mx-auto mb-2" />
              <p className="empty-state-title">Start the conversation!</p>
              <p className="empty-state-text text-xs">Great relationships begin with hello</p>
              {clientEmail && onComposeEmail && (
                <Button onClick={onComposeEmail} className="mt-3" variant="outline" size="sm">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Send First Email
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmails.map((email, index) => (
                    <TableRow 
                      key={email.id} 
                      className={`cursor-pointer hover:bg-muted/50 ${
                        index === focusedIndex ? 'bg-muted/50 ring-2 ring-primary/20' : ''
                      }`}
                      onMouseEnter={() => setFocusedIndex(index)}
                    >
                      <TableCell onClick={() => handleEmailClick(email)}>
                        <div className="font-medium truncate max-w-[200px]">{email.subject}</div>
                      </TableCell>
                      <TableCell onClick={() => handleEmailClick(email)}>
                        <EmailStatusBadge status={email.status} />
                      </TableCell>
                      <TableCell onClick={() => handleEmailClick(email)}>
                        <div className="flex items-center gap-3">
                          {(email.open_count || 0) > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              {email.open_count}
                            </Badge>
                          )}
                          {(email.click_count || 0) > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <MousePointer className="h-3 w-3 mr-1" />
                              {email.click_count}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => handleEmailClick(email)}>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(email.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEmailClick(email)}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, emails.length)} of {emails.length} emails
                  </p>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <PaginationItem key={page}>...</PaginationItem>;
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Detail Dialog */}
      <EmailDetailDialog
        open={emailDetailOpen}
        onOpenChange={setEmailDetailOpen}
        email={selectedEmail}
      />
    </div>
  );
};
