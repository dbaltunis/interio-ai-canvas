import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, AlertCircle, BarChart3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: any;
  project?: any;
}

interface ProgressItem {
  id: string;
  title: string;
  status: "completed" | "in_progress" | "pending" | "overdue";
  completedAt?: string;
  dueDate?: string;
  description?: string;
}

export const JobProgressDialog = ({ open, onOpenChange, quote, project }: JobProgressDialogProps) => {
  // Mock progress data - replace with real data
  const progressItems: ProgressItem[] = [
    {
      id: "1",
      title: "Initial Consultation",
      status: "completed",
      completedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      description: "Client meeting and requirements gathering"
    },
    {
      id: "2", 
      title: "Measurements",
      status: "completed",
      completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      description: "Site visit and window measurements"
    },
    {
      id: "3",
      title: "Design & Quote",
      status: "in_progress", 
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      description: "Creating design proposals and pricing"
    },
    {
      id: "4",
      title: "Client Approval",
      status: "pending",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      description: "Waiting for client approval of designs"
    },
    {
      id: "5",
      title: "Production",
      status: "pending",
      dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
      description: "Manufacturing of window treatments"
    },
    {
      id: "6",
      title: "Installation",
      status: "pending",
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      description: "On-site installation"
    }
  ];

  const completedItems = progressItems.filter(item => item.status === "completed").length;
  const totalItems = progressItems.length;
  const progressPercentage = (completedItems / totalItems) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Job Progress - {quote.quote_number}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto">
          {/* Overall Progress */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Overall Progress</h3>
              <span className="text-sm font-medium">{completedItems}/{totalItems} Completed</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="text-xs text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="space-y-4">
            <h3 className="font-medium">Project Timeline</h3>
            <div className="space-y-3">
              {progressItems.map((item, index) => (
                <div key={item.id} className="flex items-start space-x-3">
                  <div className="flex flex-col items-center">
                    {getStatusIcon(item.status)}
                    {index < progressItems.length - 1 && (
                      <div className="w-px h-12 bg-gray-200 mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      {item.completedAt && (
                        <span className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed {formatDistanceToNow(new Date(item.completedAt), { addSuffix: true })}
                        </span>
                      )}
                      
                      {item.dueDate && !item.completedAt && (
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due {formatDistanceToNow(new Date(item.dueDate), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};