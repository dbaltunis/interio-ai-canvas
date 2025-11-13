
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Copy, 
  StickyNote, 
  Trash2, 
  UserPlus, 
  User, 
  BarChart3,
  Edit,
  Eye,
  Share,
  FileDown,
  Mail,
  Calendar,
  Phone,
  Archive,
  Workflow
} from "lucide-react";
import { JobNotesDialog } from "./JobNotesDialog";
import { JobTeamDialog } from "./JobTeamDialog";
import { JobProgressDialog } from "./JobProgressDialog";
import { JobClientDetailsDialog } from "./JobClientDetailsDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDeleteQuote, useQuotes } from "@/hooks/useQuotes";

interface JobActionsMenuProps {
  quote: any;
  client?: any;
  project?: any;
  onJobCopy?: (jobId: string) => void;
  onJobEdit?: (jobId: string) => void;
  onJobView?: (jobId: string) => void;
  onDuplicate?: () => void;
  onExportPDF?: () => void;
  onArchive?: () => void;
}

export const JobActionsMenu = ({ 
  quote, 
  client, 
  project, 
  onJobCopy, 
  onJobEdit, 
  onJobView,
  onDuplicate,
  onExportPDF,
  onArchive
}: JobActionsMenuProps) => {
  const [showNotes, setShowNotes] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  
  const { toast } = useToast();
  const deleteQuote = useDeleteQuote();
  const { refetch } = useQuotes();

  const handleCopyJob = () => {
    onJobCopy?.(quote.id);
    toast({
      title: "Job Copied",
      description: `Job ${quote.quote_number || quote.job_number} has been copied`,
    });
  };

  const handleEditJob = () => {
    onJobEdit?.(quote.id);
  };

  const handleViewJob = () => {
    onJobView?.(quote.id);
  };

  const handleDeleteJob = async () => {
    try {
      await deleteQuote.mutateAsync(quote.id);
      
      // Immediately refetch the quotes to update the UI
      await refetch();
      
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
      
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      });
    }
  };

  const handleSendEmail = () => {
    toast({
      title: "Email",
      description: "Email functionality coming soon",
    });
  };

  const handleScheduleAppointment = () => {
    toast({
      title: "Calendar",
      description: "Appointment scheduling coming soon",
    });
  };

  const handleCallClient = () => {
    if (client?.phone) {
      window.open(`tel:${client.phone}`, '_self');
    } else {
      toast({
        title: "No Phone Number",
        description: "Client phone number not available",
      });
    }
  };

  const handleShareJob = () => {
    toast({
      title: "Share",
      description: "Share functionality coming soon",
    });
  };

  const handleDuplicateJob = () => {
    if (onDuplicate) {
      onDuplicate();
    } else {
      toast({
        title: "Duplicate",
        description: "Duplicate functionality not available",
        variant: "destructive"
      });
    }
  };

  const handleExportPDFClick = () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      toast({
        title: "Export",
        description: "Export functionality not available",
        variant: "destructive"
      });
    }
  };

  const handleWorkflows = () => {
    toast({
      title: "Workflows",
      description: "Workflow functionality coming soon",
    });
  };

  const handleArchiveClick = () => {
    if (onArchive) {
      setShowArchiveDialog(true);
    } else {
      toast({
        title: "Archive",
        description: "Archive functionality not available",
        variant: "destructive"
      });
    }
  };

  const confirmArchive = () => {
    if (onArchive) {
      onArchive();
      setShowArchiveDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg z-50">
          {onJobView && (
            <DropdownMenuItem onClick={handleViewJob}>
              <Eye className="mr-2 h-4 w-4" />
              View Job
            </DropdownMenuItem>
          )}
          
          {onJobEdit && (
            <DropdownMenuItem onClick={handleEditJob}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Job
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => setShowNotes(true)}>
            <StickyNote className="mr-2 h-4 w-4" />
            Write Note
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDuplicateJob}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate Job
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleExportPDFClick}>
            <FileDown className="mr-2 h-4 w-4" />
            Export to PDF
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleWorkflows}>
            <Workflow className="mr-2 h-4 w-4" />
            Workflows
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleShareJob}>
            <Share className="mr-2 h-4 w-4" />
            Share Job
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowProgress(true)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Progress
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {client && (
            <>
              <DropdownMenuItem onClick={() => setShowClientDetails(true)}>
                <User className="mr-2 h-4 w-4" />
                Client Details
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleSendEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleCallClient}>
                <Phone className="mr-2 h-4 w-4" />
                Call Client
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleScheduleAppointment}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Appointment
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem 
            onClick={handleArchiveClick}
            className="text-orange-600 focus:text-orange-600"
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive Job
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Job
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <JobNotesDialog 
        open={showNotes} 
        onOpenChange={setShowNotes}
        quote={quote}
        project={project}
      />

      {/* Disabled: Team functionality temporarily disabled
      <JobTeamDialog 
        open={showTeam} 
        onOpenChange={setShowTeam}
        quote={quote}
        project={project}
      />
      */}

      <JobProgressDialog 
        open={showProgress} 
        onOpenChange={setShowProgress}
        quote={quote}
        project={project}
      />

      {client && (
        <JobClientDetailsDialog 
          open={showClientDetails} 
          onOpenChange={setShowClientDetails}
          client={client}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete job {quote.quote_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJob}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive job {quote.quote_number}? This will move it to Completed status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchive}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
