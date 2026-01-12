
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Mail, 
  Search, 
  Filter, 
  Eye, 
  MoreVertical,
  Reply,
  Forward,
  CheckCircle2,
  XCircle,
  Clock,
  MousePointerClick
} from "lucide-react";
import { useEmails } from "@/hooks/useEmails";
import { format } from "date-fns";
import { EmailDetailDialog } from "../email-components/EmailDetailDialog";
import type { Email } from "@/hooks/useEmails";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCanViewEmailKPIs } from "@/hooks/useCanViewEmailKPIs";
import { useToast } from "@/hooks/use-toast";

interface AttachmentData {
  filename: string;
  type: string;
  size: number;
}

interface ProjectEmailHistoryProps {
  projectId: string;
}

export const ProjectEmailHistory = ({ projectId }: ProjectEmailHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailDetailOpen, setEmailDetailOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const { data: emails = [], isLoading } = useEmails();
  const { toast } = useToast();
  const { canViewEmailKPIs, isPermissionLoaded } = useCanViewEmailKPIs();
  
  // Filter emails for this project
  const projectEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || email.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(projectEmails.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEmails = projectEmails.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setFocusedIndex(0);
  }, [searchTerm, statusFilter]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if dialog is open or user is typing in input
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

  // Reset focused index when changing pages
  useEffect(() => {
    setFocusedIndex(0);
  }, [currentPage]);

  const handleEmailClick = (email: Email) => {
    if (!isPermissionLoaded || !canViewEmailKPIs) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to view email performance metrics.",
        variant: "destructive",
      });
      return;
    }
    setSelectedEmail(email);
    setEmailDetailOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return "default";
      case "bounced":
      case "failed":
        return "destructive";
      case "queued":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return <CheckCircle2 className="h-3 w-3" />;
      case "bounced":
      case "failed":
        return <XCircle className="h-3 w-3" />;
      case "queued":
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* Compact Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px] h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
          </SelectContent>
        </Select>
        <Select value={pageSize.toString()} onValueChange={(val) => setPageSize(parseInt(val))}>
          <SelectTrigger className="w-full sm:w-[120px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Keyboard shortcuts hint */}
      {paginatedEmails.length > 0 && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>Tip: Use ↑↓ or j/k to navigate, Enter to open</span>
        </div>
      )}

      {/* Compact Email List */}
      <div className="border rounded-lg divide-y">
        {isLoading ? (
          <div className="space-y-0 divide-y">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-6 w-20" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        ) : projectEmails.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-sm font-medium mb-1">No emails found</h3>
            <p className="text-sm text-muted-foreground">No emails match your current filters.</p>
          </div>
        ) : (
          paginatedEmails.map((email, index) => (
            <div
              key={email.id}
              className={`flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors ${
                index === focusedIndex ? 'bg-muted/50 ring-2 ring-primary/20' : ''
              } ${!isPermissionLoaded || !canViewEmailKPIs ? "cursor-default" : "cursor-pointer"}`}
              onClick={() => handleEmailClick(email)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              {/* Status Indicator */}
              <div className="flex-shrink-0">
                <Badge variant={getStatusVariant(email.status)} className="gap-1 text-xs">
                  {getStatusIcon(email.status)}
                  {email.status}
                </Badge>
              </div>

              {/* Email Content */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm truncate">{email.subject}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(email.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="truncate">To: {email.recipient_email}</span>
                  {(email.open_count > 0 || email.click_count > 0) && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {email.open_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {email.open_count}
                        </span>
                      )}
                      {email.click_count > 0 && (
                        <span className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" />
                          {email.click_count}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isPermissionLoaded || !canViewEmailKPIs) {
                        toast({
                          title: "Permission Denied",
                          description: "You don't have permission to view email performance metrics.",
                          variant: "destructive",
                        });
                        return;
                      }
                      handleEmailClick(email);
                    }}
                    disabled={!isPermissionLoaded || !canViewEmailKPIs}
                    className={!isPermissionLoaded || !canViewEmailKPIs ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward className="h-4 w-4 mr-2" />
                    Forward
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {projectEmails.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, projectEmails.length)} of {projectEmails.length} emails
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
                // Show first, last, current, and adjacent pages
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

      {/* Results Count (no pagination) */}
      {projectEmails.length > 0 && totalPages <= 1 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {projectEmails.length} email{projectEmails.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Email Detail Dialog */}
      <EmailDetailDialog
        open={emailDetailOpen}
        onOpenChange={setEmailDetailOpen}
        email={selectedEmail}
      />
    </div>
  );
};
