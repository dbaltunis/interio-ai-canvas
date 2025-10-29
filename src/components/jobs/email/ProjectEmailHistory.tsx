
import { useState } from "react";
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
  
  const { data: emails = [] } = useEmails();
  
  // Filter emails for this project
  const projectEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || email.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      </div>

      {/* Compact Email List */}
      <div className="border rounded-lg divide-y">
        {projectEmails.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-sm font-medium mb-1">No emails found</h3>
            <p className="text-sm text-muted-foreground">No emails match your current filters.</p>
          </div>
        ) : (
          projectEmails.map((email) => (
            <div
              key={email.id}
              className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
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
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
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

      {/* Results Count */}
      {projectEmails.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {projectEmails.length} email{projectEmails.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};
