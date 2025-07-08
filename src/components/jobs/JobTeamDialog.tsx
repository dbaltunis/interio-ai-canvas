import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, UserMinus, Users, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: any;
  project?: any;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "declined";
}

export const JobTeamDialog = ({ open, onOpenChange, quote, project }: JobTeamDialogProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      role: "Project Manager",
      status: "accepted"
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com", 
      role: "Designer",
      status: "pending"
    }
  ]);
  
  const { toast } = useToast();

  const handleInviteMember = () => {
    if (!email || !role) {
      toast({
        title: "Missing Information",
        description: "Please fill in both email and role",
        variant: "destructive"
      });
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role,
      status: "pending"
    };

    setTeamMembers(prev => [...prev, newMember]);
    setEmail("");
    setRole("");

    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${email}`,
    });
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    toast({
      title: "Member Removed",
      description: "Team member has been removed from the job",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "declined":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Collaboration - {quote.quote_number}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Invite new member */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-medium">Invite Team Member</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
                  <SelectItem value="Installer">Installer</SelectItem>
                  <SelectItem value="Coordinator">Coordinator</SelectItem>
                  <SelectItem value="Quality Control">Quality Control</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInviteMember}>
                <Plus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </div>
          </div>

          {/* Current team members */}
          <div className="space-y-3">
            <h3 className="font-medium">Current Team ({teamMembers.length})</h3>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {member.role}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(member.status)}`}>
                      {member.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {teamMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members yet. Invite your first team member above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};