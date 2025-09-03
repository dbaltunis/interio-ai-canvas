import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { 
  Users,
  UserPlus,
  MessageCircle,
  Eye,
  Edit3,
  Share2,
  Clock,
  Check,
  X,
  Crown,
  Shield,
  User
} from "lucide-react";
import { toast } from "sonner";

interface CollaboratorUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
  cursor?: {
    x: number;
    y: number;
    color: string;
  };
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  position: { x: number; y: number };
  resolved: boolean;
  replies: Array<{
    id: string;
    userId: string;
    content: string;
    timestamp: string;
  }>;
}

interface RealTimeCollaborationProps {
  templateId: string;
  currentUser: CollaboratorUser;
  onCollaboratorChange?: (collaborators: CollaboratorUser[]) => void;
  onCommentAdd?: (comment: Comment) => void;
}

export const RealTimeCollaboration = ({
  templateId,
  currentUser,
  onCollaboratorChange,
  onCommentAdd
}: RealTimeCollaborationProps) => {
  const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([
    {
      id: '1',
      name: 'Sarah Wilson',
      email: 'sarah@company.com',
      role: 'owner',
      status: 'online',
      lastSeen: 'now',
      cursor: { x: 100, y: 150, color: '#3B82F6' }
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'editor',
      status: 'online',
      lastSeen: 'now',
      cursor: { x: 200, y: 300, color: '#10B981' }
    },
    {
      id: '3',
      name: 'Anna Garcia',
      email: 'anna@company.com',
      role: 'viewer',
      status: 'away',
      lastSeen: '5 minutes ago'
    }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      userId: '2',
      content: 'Should we update the pricing section?',
      timestamp: '2 hours ago',
      position: { x: 400, y: 200 },
      resolved: false,
      replies: [
        {
          id: '1-1',
          userId: '1',
          content: 'Good point, let me check with the finance team.',
          timestamp: '1 hour ago'
        }
      ]
    }
  ]);

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CollaboratorUser['role']>('viewer');
  const [showComments, setShowComments] = useState(true);

  const getRoleIcon = (role: CollaboratorUser['role']) => {
    switch (role) {
      case 'owner': return <Crown className="h-3 w-3" />;
      case 'editor': return <Edit3 className="h-3 w-3" />;
      case 'commenter': return <MessageCircle className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role: CollaboratorUser['role']) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'commenter': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: CollaboratorUser['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const handleInviteUser = () => {
    if (!inviteEmail) {
      toast("Please enter an email address");
      return;
    }

    const newCollaborator: CollaboratorUser = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'offline',
      lastSeen: 'Never'
    };

    setCollaborators(prev => [...prev, newCollaborator]);
    onCollaboratorChange?.([...collaborators, newCollaborator]);
    
    setInviteEmail('');
    setShowInviteDialog(false);
    toast(`Invitation sent to ${inviteEmail}`);
  };

  const updateUserRole = (userId: string, newRole: CollaboratorUser['role']) => {
    setCollaborators(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    toast("User role updated");
  };

  const removeCollaborator = (userId: string) => {
    setCollaborators(prev => prev.filter(user => user.id !== userId));
    toast("User removed from template");
  };

  const resolveComment = (commentId: string) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId ? { ...comment, resolved: true } : comment
      )
    );
    toast("Comment resolved");
  };

  const shareTemplate = () => {
    const shareUrl = `${window.location.origin}/template/${templateId}`;
    navigator.clipboard.writeText(shareUrl);
    toast("Share link copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      {/* Active Collaborators */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Collaborators ({collaborators.filter(u => u.status === 'online').length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteDialog(!showInviteDialog)}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Invite
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Online Users */}
          <div className="space-y-2">
            {collaborators.filter(user => user.status === 'online').map(user => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{user.name}</span>
                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                {user.cursor && (
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: user.cursor.color }}
                    title="Currently editing"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Offline Users */}
          {collaborators.filter(user => user.status !== 'online').length > 0 && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Offline</p>
                {collaborators.filter(user => user.status !== 'online').map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg opacity-60">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium">{user.name}</span>
                      <p className="text-xs text-gray-400">Last seen {user.lastSeen}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Invite Form */}
          {showInviteDialog && (
            <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20 space-y-3">
              <Input
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="text-sm"
              />
              <div className="flex items-center gap-2">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as CollaboratorUser['role'])}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                >
                  <option value="viewer">Viewer</option>
                  <option value="commenter">Commenter</option>
                  <option value="editor">Editor</option>
                </select>
                <Button size="sm" onClick={handleInviteUser}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowInviteDialog(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments System */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Comments ({comments.filter(c => !c.resolved).length} active)
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {showComments && (
          <CardContent className="space-y-3">
            {comments.filter(comment => !comment.resolved).map(comment => {
              const author = collaborators.find(u => u.id === comment.userId);
              return (
                <div key={comment.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={author?.avatar} />
                      <AvatarFallback className="text-xs">
                        {author?.name.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{author?.name}</span>
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                  
                  {comment.replies.length > 0 && (
                    <div className="ml-8 space-y-2">
                      {comment.replies.map(reply => {
                        const replyAuthor = collaborators.find(u => u.id === reply.userId);
                        return (
                          <div key={reply.id} className="flex items-start gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={replyAuthor?.avatar} />
                              <AvatarFallback className="text-xs">
                                {replyAuthor?.name.split(' ').map(n => n[0]).join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">{replyAuthor?.name}</span>
                                <span className="text-xs text-gray-500">{reply.timestamp}</span>
                              </div>
                              <p className="text-xs">{reply.content}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => resolveComment(comment.id)}>
                      <Check className="h-3 w-3 mr-1" />
                      Resolve
                    </Button>
                    <Button variant="ghost" size="sm">
                      Reply
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {comments.filter(c => !c.resolved).length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active comments</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Sharing Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={shareTemplate}>
            <Share2 className="h-4 w-4 mr-2" />
            Copy share link
          </Button>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Anyone with the link can view this template</p>
            <p>• Collaborators need explicit permissions to edit</p>
            <p>• Comments are visible to all collaborators</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};