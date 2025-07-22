
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Users, Mail, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/hooks/useTeamMembers";

interface JobTeamInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: any;
  project?: any;
}

export const JobTeamInviteDialog = ({ open, onOpenChange, quote, project }: JobTeamInviteDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { data: teamMembers = [], isLoading } = useTeamMembers();
  const { toast } = useToast();

  // Mock additional users that could be available in the system
  const mockUsers = [
    {
      id: "admin-1",
      name: "InterioApp Admin",
      email: "admin@interioapp.com",
      role: "Admin",
      type: "admin"
    },
    {
      id: "maker-1", 
      name: "Jane Smith",
      email: "jane@interioapp.com",
      role: "Curtain Maker",
      type: "maker"
    },
    {
      id: "maker-2",
      name: "Bob Wilson", 
      email: "bob@interioapp.com",
      role: "Curtain Maker", 
      type: "maker"
    }
  ];

  // Combine team members with mock users
  const allUsers = [
    ...teamMembers.map(member => ({
      ...member,
      type: "team_member"
    })),
    ...mockUsers
  ];

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleInviteMembers = () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "No Members Selected",
        description: "Please select at least one team member to invite",
        variant: "destructive"
      });
      return;
    }

    const selectedUsers = allUsers.filter(user => selectedMembers.includes(user.id));
    
    // TODO: Implement actual invitation logic
    console.log('Inviting members to job:', quote?.id, selectedUsers);
    
    toast({
      title: "Invitations Sent",
      description: `Invited ${selectedMembers.length} team member(s) to job ${quote?.quote_number}`,
    });

    setSelectedMembers([]);
    onOpenChange(false);
  };

  const getRoleColor = (role: string, type: string) => {
    if (type === "admin") return "bg-purple-100 text-purple-800";
    if (type === "maker") return "bg-orange-100 text-orange-800";
    return "bg-blue-100 text-blue-800";
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Invite Team Members - {quote?.quote_number}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected count */}
          {selectedMembers.length > 0 && (
            <div className="text-sm text-blue-600">
              {selectedMembers.length} member(s) selected
            </div>
          )}

          {/* User list */}
          <div className="flex-1 overflow-y-auto space-y-2 border rounded-lg p-2">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading team members...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No team members found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleMemberToggle(user.id)}
                >
                  <Checkbox
                    checked={selectedMembers.includes(user.id)}
                    onChange={() => {}} // Handled by onClick above
                  />
                  
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {user.email}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={`text-xs ${getRoleColor(user.role, user.type)}`}>
                      {user.role}
                    </Badge>
                    {user.type === "admin" && (
                      <Badge variant="outline" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInviteMembers}
              disabled={selectedMembers.length === 0}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite {selectedMembers.length > 0 ? `${selectedMembers.length} ` : ''}Members
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
