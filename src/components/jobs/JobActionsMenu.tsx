
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
  Download,
  Mail,
  Calendar,
  Phone
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
}

export const JobActionsMenu = ({ 
  quote, 
  client, 
  project, 
  onJobCopy, 
  onJobEdit, 
  onJobView 
}: JobActionsMenuProps) => {
  const [showNotes, setShowNotes] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
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

  const handleDownloadJob = () => {
    toast({
      title: "Download",
      description: "Download functionality coming soon",
    });
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
          
          <DropdownMenuItem onClick={handleCopyJob}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Job
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleShareJob}>
            <Share className="mr-2 h-4 w-4" />
            Share Job
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleDownloadJob}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowNotes(true)}>
            <StickyNote className="mr-2 h-4 w-4" />
            Job Notes
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
            </>
          )}
          
          {/* Disabled: Team invitations temporarily disabled
          <DropdownMenuItem onClick={() => setShowTeam(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Team
          </DropdownMenuItem>
          */}
          
          <DropdownMenuSeparator />
          
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
    </>
  );
};
